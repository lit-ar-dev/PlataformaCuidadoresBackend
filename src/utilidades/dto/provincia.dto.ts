import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CiudadDto } from './ciudad.dto';

export class ProvinciaDto {
	@IsNotEmpty()
	@IsString()
	id: string;

	@IsNotEmpty()
	@IsString()
	nombre: string;

	@IsArray()
	ciudades: CiudadDto[];
}
