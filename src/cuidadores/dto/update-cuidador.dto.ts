import { PartialType } from '@nestjs/mapped-types';
import { CreateCuidadorDto } from './create-cuidador.dto';

export class UpdateCuidadorDto extends PartialType(CreateCuidadorDto) {}
