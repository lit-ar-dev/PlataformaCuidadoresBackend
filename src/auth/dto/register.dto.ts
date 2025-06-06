import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/usuario.entity';

export class RegisterDto {
	@IsNotEmpty()
	@IsString()
	nombre: string;

	@IsNotEmpty()
	@IsString()
	apellido: string;

	@IsEmail()
	email: string;

	@IsNotEmpty()
	@MinLength(6)
	password: string;

	@IsNotEmpty()
	role: UserRole.ADMIN | UserRole.CUIDADOR | UserRole.CLIENTE;
}
