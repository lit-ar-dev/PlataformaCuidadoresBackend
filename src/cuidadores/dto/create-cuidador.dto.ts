import {
	IsNotEmpty,
	IsString,
	IsArray,
	IsOptional,
	ValidateNested,
} from 'class-validator';
import { CreateTarifaDto } from './create-tarifa.dto';
import { Type } from 'class-transformer';

export class CreateCuidadorDto {
	@IsNotEmpty()
	@IsString()
	descripcion: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	experiencia?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	formacion?: string[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateTarifaDto)
	tarifas: CreateTarifaDto[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[];
}
