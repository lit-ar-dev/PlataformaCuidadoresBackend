import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePreferenceDto {
	@IsNumber()
	@IsNotEmpty()
	total: number;

	@IsString()
	@IsNotEmpty()
	description: string;
}
