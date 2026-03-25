import { ClientsService } from './../clients/clients.service';
import { CaregiversService } from './../caregivers/caregivers.service';
import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { PersonsService } from 'src/persons/persons.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
	private otcStore = new Map<string, { token: string; expiresAt: number }>();
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Role)
		private readonly roleRepository: Repository<Role>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Permission)
		private readonly permissionRepository: Repository<Permission>,
		private readonly usersService: UsersService,
		private readonly personsService: PersonsService,
		private readonly jwtService: JwtService,
		private readonly caregiversService: CaregiversService,
		private readonly clientsService: ClientsService,
	) {}

	async register(registerDto: RegisterDto): Promise<{ token: string }> {
		try {
			const result = await this.dataSource.transaction(
				async (manager) => {
					const userRepository = manager.getRepository(User);
					const existing = await userRepository.findOne({
						where: { email: registerDto.user.email },
					});
					if (existing)
						throw new UnauthorizedException(
							'Email is already registered',
						);

					const person = await this.personsService.create(
						registerDto.person,
						manager,
					);

					const roles = await Promise.all(
						registerDto.roleIds.map((id) =>
							this.findRoleById(id, manager),
						),
					).then((rs) => rs.filter((r): r is Role => !!r));

					roles.push((await this.findUserRole()) as Role);

					const user = await this.usersService.create(
						registerDto.user,
						person,
						roles,
						manager,
					);

					for (const role of roles) {
						if (role.name.toLowerCase() === 'caregiver') {
							await this.caregiversService.create(
								registerDto.caregiver,
								user,
								manager,
							);
						} else if (role.name.toLowerCase() === 'client') {
							await this.clientsService.create(
								registerDto.client,
								user,
								manager,
							);
						}
					}

					return user;
				},
			);

			const payload = {
				sub: result.id,
				roles: result.roles?.map((r) => r.name),
			};
			const token = this.jwtService.sign(payload);
			return { token };
		} catch (err: any) {
			if (err?.code === '23505') {
				throw new ConflictException('Duplicate unique registration');
			}
			throw err;
		}
	}

	async validateUser(
		email: string,
		password: string,
	): Promise<User | null> {
		const user = await this.userRepository.findOne({
			where: { email },
		});
		if (!user) return null;
		if (!user.password) return null;
		const valid = await bcrypt.compare(password, user.password);
		if (valid) return user;
		return null;
	}

	async login(loginDto: LoginDto): Promise<{ token: string }> {
		const { email, password } = loginDto;
		const user = await this.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const payload = { sub: user.id, roles: user.roles };
		const token = this.jwtService.sign(payload);
		return { token };
	}

	async emailExists(email: string): Promise<boolean> {
		const user = await this.userRepository.findOne({
			where: { email },
		});
		return !!user;
	}

	isAllowedRedirect(redirectUri: string) {
		// validate against allowlist env var
		console.log(redirectUri);
		const allowed = (process.env.FRONTEND_ALLOWLIST || '').split(',');
		console.log(allowed);
		return allowed.includes(redirectUri);
	}

	async createOneTimeCodeForToken(token: string) {
		const otc = uuidv4();
		const ttl =
			parseInt(process.env.ONE_TIME_CODE_TTL_SEC || '60', 10) * 1000;
		this.otcStore.set(otc, { token, expiresAt: Date.now() + ttl });
		// schedule cleanup (prod -> use redis with TTL)
		setTimeout(() => this.otcStore.delete(otc), ttl + 1000);
		return otc;
	}

	async consumeOneTimeCode(otc: string) {
		const entry = this.otcStore.get(otc);
		if (!entry) return null;
		if (Date.now() > entry.expiresAt) {
			this.otcStore.delete(otc);
			return null;
		}
		this.otcStore.delete(otc);
		return entry.token;
	}

	async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
		const role = this.roleRepository.create(createRoleDto);
		return this.roleRepository.save(role);
	}

	async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
		const permission = this.permissionRepository.create(createPermissionDto);
		if (!permission.roles) {
			permission.roles = [];
		}
		for (const roleId of createPermissionDto.roleIds) {
			const role = await this.findRoleById(roleId);
			if (!role) {
				throw new NotFoundException(
					`Role with id ${roleId} not found`,
				);
			}
			permission.roles.push(role);
		}
		return this.permissionRepository.save(permission);
	}

	async findAllRolesExceptAdminUser(): Promise<Role[]> {
		return this.roleRepository.find({
			where: {
				name: Not(In(['Admin', 'admin', 'User', 'user'])),
			},
		});
	}

	async findUserRole(): Promise<Role | null> {
		const role = await this.roleRepository.findOne({
			where: { name: In(['User', 'user']) },
		});
		return role;
	}

	async findAllPermissions(): Promise<Permission[]> {
		return this.permissionRepository.find();
	}

	async findRoleById(
		id: string,
		manager?: EntityManager,
	): Promise<Role | null> {
		const roleRepository = manager
			? manager.getRepository(Role)
			: this.roleRepository;

		const role = await roleRepository.findOne({ where: { id } });
		if (!role) {
			throw new NotFoundException(`Role with id ${id} not found`);
		}
		return role;
	}

	async findPermissionById(
		id: number,
		manager?: EntityManager,
	): Promise<Permission | null> {
		const permissionRepository = manager
			? manager.getRepository(Permission)
			: this.permissionRepository;

		const permission = await permissionRepository.findOne({ where: { id } });
		if (!permission) {
			throw new NotFoundException(`Permission with id ${id} not found`);
		}
		return permission;
	}

	async removeRole(id: number): Promise<void> {
		const result = await this.roleRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Role with id ${id} not found`);
		}
	}

	async removePermission(id: number): Promise<void> {
		const result = await this.permissionRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Permission with id ${id} not found`);
		}
	}
}
