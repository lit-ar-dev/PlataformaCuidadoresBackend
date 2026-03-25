import {
	IsNotEmpty,
	IsString,
	IsArray,
	IsOptional,
	ValidateNested,
} from 'class-validator';
import { CreateRateDto } from './create-rate.dto';
import { Type } from 'class-transformer';

export class CreateCaregiverDto {
	@IsNotEmpty()
	@IsString()
	description: string;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	experience?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	training?: string[];

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateRateDto)
	rates: CreateRateDto[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[];
}
