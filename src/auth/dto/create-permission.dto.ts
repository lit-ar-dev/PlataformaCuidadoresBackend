import { IsArray, IsNotEmpty } from 'class-validator';
import { CreateUtilityDto } from 'src/utilities/dto/create-utility.dto';

export class CreatePermissionDto extends CreateUtilityDto {
	@IsNotEmpty()
	@IsArray()
	roleIds: string[];
}
