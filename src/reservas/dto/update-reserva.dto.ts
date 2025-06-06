import { PartialType } from '@nestjs/mapped-types';
import { CreateReservaDto } from './create-reserva.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { EstadoReserva } from '../entities/reserva.entity';

export class UpdateReservaDto extends PartialType(CreateReservaDto) {
	@IsOptional()
	@IsEnum(EstadoReserva)
	estado?: EstadoReserva;
}
