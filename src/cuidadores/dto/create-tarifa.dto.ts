import { IsString, IsNumber, IsNotEmpty, IsArray } from 'class-validator';

export class CreateTarifaDto {
	@IsNotEmpty()
	@IsNumber()
	precio: number;

	@IsNotEmpty()
	@IsArray()
	@IsString({ each: true })
	servicios: string[];

	@IsNotEmpty()
	@IsNumber()
	grupoId: number;
}
