import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
	@IsNotEmpty()
	@IsString()
	address: string;
}
