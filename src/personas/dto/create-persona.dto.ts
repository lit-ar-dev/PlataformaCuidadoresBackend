import { Type } from 'class-transformer';
import {
	IsDate,
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
	@Type(() => Date)
	@IsDate()
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
