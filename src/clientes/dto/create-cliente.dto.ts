import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClienteDto {
	@IsNotEmpty()
	@IsString()
	domicilio: string;
}
