import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UtilitiesService } from './utilities.service';
import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Gender } from './entities/gender.entity';
import { City } from './entities/city.entity';
import { Province } from './entities/province.entity';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { Group } from './entities/group.entity';

@Controller('utilities')
export class UtilitiesController {
	constructor(private readonly utilitiesService: UtilitiesService) {}

	@Post('/genders')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createGender(@Body() createGenderDto: CreateUtilityDto) {
		return this.utilitiesService.createGender(createGenderDto);
	}

	@Post('/import-provinces-localities')
	//@UseGuards(JwtAuthGuard, RolesGuard)
	//@Roles('admin')
	async importProvincesLocalities() {
		return this.utilitiesService.importProvincesAndLocalities();
	}

	@Post('/cities')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createCity(@Body() createCityDto: CreateUtilityDto) {
		return this.utilitiesService.createCity(createCityDto);
	}

	@Post('/provinces')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createProvince(@Body() createProvinceDto: CreateUtilityDto) {
		return this.utilitiesService.createProvince(createProvinceDto);
	}

	@Post('/groups')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async createGroup(@Body() createGroupDto: CreateUtilityDto) {
		return this.utilitiesService.createGroup(createGroupDto);
	}

	@Get('/genders')
	async findAllGenders() {
		return this.utilitiesService.findAllGenders();
	}

	@Get('/cities')
	async findAllCities() {
		return this.utilitiesService.findAllCities();
	}

	@Get('/provinces')
	async findAllProvinces() {
		return this.utilitiesService.findAllProvinces();
	}

	@Get('/groups')
	async findAllGroups() {
		return this.utilitiesService.findAllGroups();
	}

	@Get('/provinces/:id/cities')
	async findCitiesByProvince(@Param('id') id: number) {
		return this.utilitiesService.findCitiesByProvince(id);
	}

	@Get('/genders/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneGender(@Param('id') id: number) {
		// validations are still missing
		return this.utilitiesService.findGenderById(id);
	}

	@Get('/cities/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneCity(@Param('id') id: number) {
		// validations are still missing
		return this.utilitiesService.findCityById(id);
	}

	@Get('/provinces/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneProvince(@Param('id') id: number) {
		// validations are still missing
		return this.utilitiesService.findProvinceById(id);
	}

	@Get('/groups/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findOneGroup(@Param('id') id: number) {
		// validations are still missing
		return this.utilitiesService.findGroupById(id);
	}

	@Patch('/genders/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateGender(
		@Param('id') id: number,
		@Body() updateGenderDto: Partial<Gender>,
	) {
		return this.utilitiesService.updateGender(id, updateGenderDto);
	}

	@Patch('/cities/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateCity(
		@Param('id') id: number,
		@Body() updateCityDto: Partial<City>,
	) {
		return this.utilitiesService.updateCity(id, updateCityDto);
	}

	@Patch('/provinces/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateProvince(
		@Param('id') id: number,
		@Body() updateProvinceDto: Partial<Province>,
	) {
		return this.utilitiesService.updateProvince(id, updateProvinceDto);
	}

	@Patch('/groups/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async updateGroup(
		@Param('id') id: number,
		@Body() updateGroupDto: Partial<Group>,
	) {
		return this.utilitiesService.updateGroup(id, updateGroupDto);
	}

	@Delete('/genders/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeGender(@Param('id') id: number) {
		await this.utilitiesService.removeGender(id);
		return { message: `Gender ${id} deleted` };
	}

	@Delete('/cities/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeCity(@Param('id') id: number) {
		await this.utilitiesService.removeCity(id);
		return { message: `City ${id} deleted` };
	}

	@Delete('/provinces/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeProvince(@Param('id') id: number) {
		await this.utilitiesService.removeProvince(id);
		return { message: `Province ${id} deleted` };
	}

	@Delete('/groups/:id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async removeGroup(@Param('id') id: number) {
		await this.utilitiesService.removeGroup(id);
		return { message: `Group ${id} deleted` };
	}
}
