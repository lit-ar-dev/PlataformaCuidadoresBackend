import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsOptional()
	@MinLength(6)
	contraseña?: string;
}
