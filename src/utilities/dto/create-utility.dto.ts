import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUtilityDto {
	@IsNotEmpty()
	@IsString()
	name: string;
}
