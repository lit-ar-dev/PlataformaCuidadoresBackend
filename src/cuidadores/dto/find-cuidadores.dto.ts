import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_SORT = ['createdAt', 'nombre', 'rating'];

export class FindCuidadoresDto {
	@IsOptional()
	@IsString()
	nombre?: string;

	@IsOptional()
	@IsString()
	ciudad?: string;

	@IsOptional()
	@IsString()
	provincia?: string;

	@IsOptional()
	@IsString()
	tag?: string;

	@IsOptional()
	@IsString()
	servicio?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	minEdad?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	maxEdad?: number;

	@IsOptional()
	@IsString()
	genero?: string;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	minPrecio?: number;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(0)
	maxPrecio?: number;

	@IsOptional()
	@IsString()
	grupo?: string;

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
