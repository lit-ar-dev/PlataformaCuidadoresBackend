import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUsuarioDto } from '../../usuarios/dto/create-usuario.dto';
import { CreatePersonaDto } from './../../personas/dto/create-persona.dto';
import { CreateClienteDto } from '../../clientes/dto/create-cliente.dto';
import { CreateCuidadorDto } from '../../cuidadores/dto/create-cuidador.dto';

export class RegisterDto {
	@ValidateNested()
	@Type(() => CreateUsuarioDto)
	usuario: CreateUsuarioDto;

	@ValidateNested()
	@Type(() => CreatePersonaDto)
	persona: CreatePersonaDto;

	@ValidateNested()
	@Type(() => CreateClienteDto)
	cliente: CreateClienteDto;

	@ValidateNested()
	@Type(() => CreateCuidadorDto)
	cuidador: CreateCuidadorDto;

	@IsNotEmpty()
	@IsArray()
	rolesId: string[];
}
