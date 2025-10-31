import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Persona } from 'src/personas/entities/persona.entity';
import { Rol } from 'src/auth/entities/rol.entity';

@Injectable()
export class UsuariosService {
	constructor(
		@InjectRepository(Usuario)
		private readonly usuarioRepository: Repository<Usuario>,
	) {}

	async create(
		createUsuarioDto: CreateUsuarioDto,
		persona: Persona,
		roles?: Rol[],
		manager?: EntityManager,
	): Promise<Usuario> {
		const usuarioRepository = manager
			? manager.getRepository(Usuario)
			: this.usuarioRepository;
		createUsuarioDto.email = createUsuarioDto.email.toLowerCase();
		const usuario = usuarioRepository.create(createUsuarioDto);
		usuario.persona = persona;
		if (roles) {
			usuario.roles = roles;
		}
		return usuarioRepository.save(usuario);
	}

	async findAll(): Promise<Usuario[]> {
		return this.usuarioRepository.find({ relations: ['persona', 'roles'] });
	}

	async findOne(id: string): Promise<Usuario> {
		const usuario = await this.usuarioRepository.findOne({
			where: { id },
			relations: ['persona', 'roles'],
		});
		if (!usuario) {
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		}
		return usuario;
	}

	async findOneWithRolesAndPerms(id: string): Promise<Usuario> {
		const usuario = await this.usuarioRepository.findOne({
			where: { id },
			relations: ['persona', 'roles', 'roles.permisos'],
			select: {
				id: true,
				persona: {
					nombre: true,
					apellido: true,
				},
				email: true,
				roles: {
					id: true,
					nombre: true,
					permisos: {
						id: true,
						nombre: true,
					},
				},
			},
		});
		if (!usuario) {
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		}
		return usuario;
	}

	async findByEmail(email: string): Promise<Usuario | null> {
		const usuario = await this.usuarioRepository.findOne({
			where: { email },
			relations: ['persona', 'roles'],
		});
		if (!usuario) {
			throw new NotFoundException(
				`Usuario con email ${email} no encontrado`,
			);
		}
		return usuario;
	}

	async update(
		id: string,
		updateUsuarioDto: Partial<CreateUsuarioDto>,
	): Promise<Usuario> {
		const usuario = await this.findOne(id);
		if (!usuario) {
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		}
		Object.assign(usuario, updateUsuarioDto);
		return this.usuarioRepository.save(usuario);
	}

	async remove(id: string): Promise<void> {
		const result = await this.usuarioRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		}
	}

	async uploadFoto(fotoUrl: string, usuarioId: string): Promise<Usuario> {
		const usuario = await this.findOne(usuarioId);
		usuario.fotoUrl = fotoUrl;
		return this.usuarioRepository.save(usuario);
	}
}
