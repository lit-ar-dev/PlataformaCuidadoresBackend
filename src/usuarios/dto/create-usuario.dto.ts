import {
	IsBase64,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@MinLength(6)
	contraseña: string;

	@IsOptional()
	@IsBase64()
	foto?: string;
}
