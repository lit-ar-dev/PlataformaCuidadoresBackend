import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(Usuario)
		private readonly usuarioRepository: Repository<Usuario>,
		private readonly jwtService: JwtService,
	) {}

	async register(registerDto: RegisterDto): Promise<{ token: string }> {
		const { nombre, apellido, email, password, role } = registerDto;
		const usuarioExists = await this.usuarioRepository.findOne({
			where: { email },
		});
		if (usuarioExists) {
			throw new UnauthorizedException('El correo ya está registrado');
		}
		const usuario = this.usuarioRepository.create({
			nombre,
			apellido,
			email,
			password,
			role,
		});
		await this.usuarioRepository.save(usuario);
		const payload = { sub: usuario.id, role: usuario.role };
		const token = this.jwtService.sign(payload);
		return { token };
	}

	async validateUsuario(
		email: string,
		password: string,
	): Promise<Usuario | null> {
		const usuario = await this.usuarioRepository.findOne({
			where: { email },
		});
		if (!usuario) return null;
		const valid = await bcrypt.compare(password, usuario.password);
		if (valid) return usuario;
		return null;
	}

	async login(loginDto: LoginDto): Promise<{ token: string }> {
		const { email, password } = loginDto;
		const usuario = await this.validateUsuario(email, password);
		if (!usuario) {
			throw new UnauthorizedException('Credenciales inválidas');
		}
		const payload = { sub: usuario.id, role: usuario.role };
		return {
			token: this.jwtService.sign(payload),
		};
	}

	async findAll(): Promise<Usuario[]> {
		return this.usuarioRepository.find();
	}

	async findOne(id: string): Promise<Usuario> {
		const usuario = await this.usuarioRepository.findOne({ where: { id } });
		if (!usuario) {
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		}
		return usuario;
	}
}
