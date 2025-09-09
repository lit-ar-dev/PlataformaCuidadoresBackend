import { IsNotEmpty, IsString } from 'class-validator';

export class CiudadDto {
	@IsNotEmpty()
	@IsString()
	id: string;

	@IsNotEmpty()
	@IsString()
	nombre: string;
}
