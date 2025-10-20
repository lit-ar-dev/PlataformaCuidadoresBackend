import { ClientesService } from './../clientes/clientes.service';
import { CuidadoresService } from './../cuidadores/cuidadores.service';
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
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { PersonasService } from 'src/personas/personas.service';
import { Rol } from './entities/rol.entity';
import { Permiso } from './entities/permiso.entity';
import { CreateRolDto } from './dto/create-rol.dto';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
	private otcStore = new Map<string, { token: string; expiresAt: number }>();
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Rol)
		private readonly rolRepository: Repository<Rol>,
		@InjectRepository(Usuario)
		private readonly usuarioRepository: Repository<Usuario>,
		@InjectRepository(Permiso)
		private readonly permisoRepository: Repository<Permiso>,
		private readonly usuariosService: UsuariosService,
		private readonly personasService: PersonasService,
		private readonly jwtService: JwtService,
		private readonly cuidadoresService: CuidadoresService,
		private readonly clientesService: ClientesService,
	) {}

	async register(registerDto: RegisterDto): Promise<{ token: string }> {
		try {
			const result = await this.dataSource.transaction(
				async (manager) => {
					const usuarioRepository = manager.getRepository(Usuario);
					const existing = await usuarioRepository.findOne({
						where: { email: registerDto.usuario.email },
					});
					if (existing)
						throw new UnauthorizedException(
							'El correo ya está registrado',
						);

					const persona = await this.personasService.create(
						registerDto.persona,
						manager,
					);

					const roles = await Promise.all(
						registerDto.rolesId.map((id) =>
							this.findRolById(id, manager),
						),
					).then((rs) => rs.filter((r): r is Rol => !!r));

					roles.push((await this.findUsuarioRol()) as Rol);

					const usuario = await this.usuariosService.create(
						registerDto.usuario,
						persona,
						roles,
						manager,
					);

					for (const rol of roles) {
						if (rol.nombre.toLowerCase() === 'cuidador') {
							await this.cuidadoresService.create(
								registerDto.cuidador,
								usuario,
								manager,
							);
						} else if (rol.nombre.toLowerCase() === 'cliente') {
							await this.clientesService.create(
								registerDto.cliente,
								usuario,
								manager,
							);
						}
					}

					return usuario;
				},
			);

			const payload = {
				sub: result.id,
				roles: result.roles?.map((r) => r.nombre),
			};
			const token = this.jwtService.sign(payload);
			return { token };
		} catch (err: any) {
			if (err?.code === '23505') {
				throw new ConflictException('Registro único duplicado');
			}
			throw err;
		}
	}

	async validateUsuario(
		email: string,
		contraseña: string,
	): Promise<Usuario | null> {
		const usuario = await this.usuarioRepository.findOne({
			where: { email },
		});
		if (!usuario) return null;
		if (!usuario.contraseña) return null;
		const valid = await bcrypt.compare(contraseña, usuario.contraseña);
		if (valid) return usuario;
		return null;
	}

	async login(loginDto: LoginDto): Promise<{ token: string }> {
		const { email, contraseña } = loginDto;
		const usuario = await this.validateUsuario(email, contraseña);
		if (!usuario) {
			throw new UnauthorizedException('Credenciales inválidas');
		}
		const payload = { sub: usuario.id, roles: usuario.roles };
		const token = this.jwtService.sign(payload);
		return { token };
	}

	async emailExists(email: string): Promise<boolean> {
		const usuario = await this.usuarioRepository.findOne({
			where: { email },
		});
		return !!usuario;
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

	async createRol(createRolDto: CreateRolDto): Promise<Rol> {
		const rol = this.rolRepository.create(createRolDto);
		return this.rolRepository.save(rol);
	}

	async createPermiso(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
		const permiso = this.permisoRepository.create(createPermisoDto);
		if (!permiso.roles) {
			permiso.roles = [];
		}
		for (const rolId of createPermisoDto.rolesId) {
			const rol = await this.findRolById(rolId);
			if (!rol) {
				throw new NotFoundException(
					`Rol con id ${rolId} no encontrado`,
				);
			}
			permiso.roles.push(rol);
		}
		return this.permisoRepository.save(permiso);
	}

	async findAllRolesExceptAdminUsuario(): Promise<Rol[]> {
		return this.rolRepository.find({
			where: {
				nombre: Not(In(['Admin', 'admin', 'Usuario', 'usuario'])),
			},
		});
	}

	async findUsuarioRol(): Promise<Rol | null> {
		const rol = await this.rolRepository.findOne({
			where: { nombre: In(['Usuario', 'usuario']) },
		});
		return rol;
	}

	async findAllPermisos(): Promise<Permiso[]> {
		return this.permisoRepository.find();
	}

	async findRolById(
		id: string,
		manager?: EntityManager,
	): Promise<Rol | null> {
		const rolRepository = manager
			? manager.getRepository(Rol)
			: this.rolRepository;

		const rol = await rolRepository.findOne({ where: { id } });
		if (!rol) {
			throw new NotFoundException(`Rol con id ${id} no encontrado`);
		}
		return rol;
	}

	async findPermisoById(
		id: number,
		manager?: EntityManager,
	): Promise<Permiso | null> {
		const permisoRepository = manager
			? manager.getRepository(Permiso)
			: this.permisoRepository;

		const permiso = await permisoRepository.findOne({ where: { id } });
		if (!permiso) {
			throw new NotFoundException(`Permiso con id ${id} no encontrado`);
		}
		return permiso;
	}

	async removeRol(id: number): Promise<void> {
		const result = await this.rolRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Rol con id ${id} no encontrado`);
		}
	}

	async removePermiso(id: number): Promise<void> {
		const result = await this.permisoRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Permiso con id ${id} no encontrado`);
		}
	}
}
