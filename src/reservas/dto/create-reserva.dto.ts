import {
	IsNotEmpty,
	IsUUID,
	IsDateString,
	IsNumber,
	IsOptional,
} from 'class-validator';

export class CreateReservaDto {
	@IsNotEmpty()
	@IsUUID()
	cuidadorId: string;

	@IsNotEmpty()
	@IsUUID()
	clienteId: string;

	@IsNotEmpty()
	@IsDateString()
	fechaInicio: Date;

	@IsNotEmpty()
	@IsDateString()
	fechaFin: Date;

	@IsOptional()
	@IsNumber()
	precioTotal?: number;
}
