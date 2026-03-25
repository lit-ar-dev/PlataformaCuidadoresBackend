import { IsOptional, IsString, IsInt, Min, Max, IsIn, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_SORT = ['createdAt', 'name', 'rating'];

export class FindCaregiversDto {
	@IsOptional()
	@IsString()
	name?: string;

	@IsOptional()
	@IsString()
	city?: string;

	@IsOptional()
	@IsString()
	province?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	minAge?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	maxAge?: number;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	minPrice?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	maxPrice?: number;

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	tags?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	services?: string[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	groups?: string[];

	/* @IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	minRating?: number;
	
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	maxRating?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20;

	@IsOptional()
	@IsIn(ALLOWED_SORT)
	sort?: string = 'createdAt';

	@IsOptional()
	@IsIn(['asc', 'desc'])
	order?: 'asc' | 'desc' = 'desc'; */
}
