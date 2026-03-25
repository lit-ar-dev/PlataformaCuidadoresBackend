import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

export class CreateUserDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsOptional()
	@MinLength(6)
	password?: string;
}
