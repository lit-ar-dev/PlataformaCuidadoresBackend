import { IsNotEmpty, IsString } from 'class-validator';

export class CityDto {
	@IsNotEmpty()
	@IsString()
	id: string;

	@IsNotEmpty()
	@IsString()
	name: string;
}
