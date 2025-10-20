import { IsArray, IsNotEmpty } from 'class-validator';
import { CreateUtilidadDto } from 'src/utilidades/dto/create-utilidad.dto';

export class CreatePermisoDto extends CreateUtilidadDto {
	@IsNotEmpty()
	@IsArray()
	rolesId: string[];
}
