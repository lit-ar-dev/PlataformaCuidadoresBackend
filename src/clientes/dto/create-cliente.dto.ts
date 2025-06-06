import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateClienteDto {
	@IsNotEmpty()
	domicilio: string;

	@IsOptional()
	@IsString()
	telefono?: string;

	@IsNotEmpty()
	@IsString()
	usuarioId: string;
}
