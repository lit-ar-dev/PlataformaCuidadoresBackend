import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePreferenciaDto {
	@IsNumber()
	@IsNotEmpty()
	total: number;

	@IsString()
	@IsNotEmpty()
	descripcion: string;
}
