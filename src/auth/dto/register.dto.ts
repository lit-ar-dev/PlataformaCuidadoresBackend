import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreatePersonDto } from './../../persons/dto/create-person.dto';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { CreateCaregiverDto } from '../../caregivers/dto/create-caregiver.dto';

export class RegisterDto {
	@ValidateNested()
	@Type(() => CreateUserDto)
	user: CreateUserDto;

	@ValidateNested()
	@Type(() => CreatePersonDto)
	person: CreatePersonDto;

	@ValidateNested()
	@Type(() => CreateClientDto)
	client: CreateClientDto;

	@ValidateNested()
	@Type(() => CreateCaregiverDto)
	caregiver: CreateCaregiverDto;

	@IsNotEmpty()
	@IsArray()
	roleIds: string[];
}
