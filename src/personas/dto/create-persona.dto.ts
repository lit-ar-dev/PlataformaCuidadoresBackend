import {
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreatePersonaDto {
	@IsNotEmpty()
	@IsString()
	nombre: string;

	@IsNotEmpty()
	@IsString()
	apellido: string;

	@IsNotEmpty()
	//@IsDateString()
	fechaDeNacimiento: Date;

	@IsOptional()
	@IsString()
	telefono?: string;

	@IsNotEmpty()
	@IsNumber()
	ciudadId: number;

	@IsOptional()
	@IsNumber()
	generoId?: number;
}
