import {
	IsNotEmpty,
	IsUUID,
	IsDateString,
	IsNumber,
	IsOptional,
} from 'class-validator';

export class CreateReservationDto {
	@IsNotEmpty()
	@IsUUID()
	caregiverId: string;

	@IsNotEmpty()
	@IsUUID()
	clientId: string;

	@IsNotEmpty()
	@IsDateString()
	startDate: Date;

	@IsNotEmpty()
	@IsDateString()
	endDate: Date;

	@IsOptional()
	@IsNumber()
	totalPrice?: number;
}
