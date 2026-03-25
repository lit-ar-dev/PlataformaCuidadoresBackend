import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { CityDto } from './city.dto';

export class ProvinceDto {
	@IsNotEmpty()
	@IsString()
	id: string;

	@IsNotEmpty()
	@IsString()
	name: string;

	@IsArray()
	cities: CityDto[];
}
