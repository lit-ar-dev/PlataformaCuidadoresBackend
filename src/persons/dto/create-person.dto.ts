import { Type } from 'class-transformer';
import {
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CreatePersonDto {
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsNotEmpty()
	@IsString()
	lastName: string;

	@IsNotEmpty()
	@Type(() => Date)
	@IsDate()
	birthDate: Date;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsNotEmpty()
	@IsNumber()
	cityId: number;

	@IsOptional()
	@IsNumber()
	genderId?: number;
}
