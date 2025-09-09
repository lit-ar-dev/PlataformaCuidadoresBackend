import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUtilidadDto {
	@IsNotEmpty()
	@IsString()
	nombre: string;
}
