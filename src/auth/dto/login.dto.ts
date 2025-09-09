import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@MinLength(6)
	contraseña: string;
}
