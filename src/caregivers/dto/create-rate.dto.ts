import { IsString, IsNumber, IsNotEmpty, IsArray } from 'class-validator';

export class CreateRateDto {
	@IsNotEmpty()
	@IsNumber()
	price: number;

	@IsNotEmpty()
	@IsArray()
	@IsString({ each: true })
	services: string[];

	@IsNotEmpty()
	@IsNumber()
	groupId: number;
}
