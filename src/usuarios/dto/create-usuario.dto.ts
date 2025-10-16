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

	@IsOptional()
	@MinLength(6)
	contraseña?: string;

	@IsOptional()
	@IsBase64()
	foto?: string;
}
