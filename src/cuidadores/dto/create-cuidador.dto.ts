import {
	IsNotEmpty,
	IsString,
	IsArray,
	IsOptional,
	IsNumber,
} from 'class-validator';

export class CreateCuidadorDto {
	@IsNotEmpty()
	@IsString()
	descripcion: string;

	@IsNotEmpty()
	@IsNumber()
	precioXHora: number;

	@IsArray()
	@IsOptional()
	especialidades?: string[];

	@IsOptional()
	disponible?: boolean;

	@IsNotEmpty()
	@IsString()
	usuarioId: string;
}
