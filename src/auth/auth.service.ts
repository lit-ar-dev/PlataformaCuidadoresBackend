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

@Injectable()
export class AuthService {
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

					const usuario = await this.usuariosService.create(
						registerDto.usuario,
						persona,
						roles,
						manager,
					);

					for (const rol of roles) {
						if (rol.nombre === 'cuidador') {
							await this.cuidadoresService.create(
								registerDto.cuidador,
								usuario,
								manager,
							);
						} else if (rol.nombre === 'cliente') {
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

	async findAllRolesExceptAdmin(): Promise<Rol[]> {
		return this.rolRepository.find({
			where: { nombre: Not(In(['Admin', 'admin'])) },
		});
	}

	async findAllPermisos(): Promise<Permiso[]> {
		return this.permisoRepository.find();
	}

	async findRolById(
		id: number,
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
