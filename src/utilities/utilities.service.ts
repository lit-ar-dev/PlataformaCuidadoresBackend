import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	OnModuleInit,
} from '@nestjs/common';
import { Gender } from './entities/gender.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Province } from './entities/province.entity';
import { CreateUtilityDto } from './dto/create-utility.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Group } from './entities/group.entity';

@Injectable()
export class UtilitiesService {
	constructor(
		@InjectRepository(Gender)
		private readonly genderRepository: Repository<Gender>,
		@InjectRepository(City)
		private readonly cityRepository: Repository<City>,
		@InjectRepository(Province)
		private readonly provinceRepository: Repository<Province>,
		@InjectRepository(Group)
		private readonly groupRepository: Repository<Group>,
		private readonly http: HttpService,
	) {}

	/*async onModuleInit() {
		try {
			await this.refresh();
		} catch (err) {
			console.log(err);
			throw new InternalServerErrorException(
				'Error initializing the utilities module',
			);
		}
	}*/

	async createGender(createUtilityDto: CreateUtilityDto): Promise<Gender> {
		const gender = this.genderRepository.create(createUtilityDto);
		return this.genderRepository.save(gender);
	}

	async createCity(createUtilityDto: CreateUtilityDto): Promise<City> {
		const city = this.cityRepository.create(createUtilityDto);
		return this.cityRepository.save(city);
	}

	async createProvince(
		createUtilityDto: CreateUtilityDto,
	): Promise<Province> {
		const province = this.provinceRepository.create(createUtilityDto);
		return this.provinceRepository.save(province);
	}

	async createGroup(createUtilityDto: CreateUtilityDto): Promise<Group> {
		const group = this.groupRepository.create(createUtilityDto);
		return this.groupRepository.save(group);
	}

	async findAllGenders(manager?: EntityManager): Promise<Gender[]> {
		const genderRepository = manager
			? manager.getRepository(Gender)
			: this.genderRepository;
		return genderRepository.find();
	}

	async findAllCities(manager?: EntityManager): Promise<City[]> {
		const cityRepository = manager
			? manager.getRepository(City)
			: this.cityRepository;
		const cities = await cityRepository.find();
		return cities.sort((a, b) => a.name.localeCompare(b.name));
	}

	async findAllProvinces(manager?: EntityManager): Promise<Province[]> {
		const provinceRepository = manager
			? manager.getRepository(Province)
			: this.provinceRepository;
		const provinces = await provinceRepository.find();
		return provinces.sort((a, b) => a.name.localeCompare(b.name));
	}

	async findAllGroups(manager?: EntityManager): Promise<Group[]> {
		const groupRepository = manager
			? manager.getRepository(Group)
			: this.groupRepository;
		return groupRepository.find();
	}

	async findGenderById(
		id: number,
		manager?: EntityManager,
	): Promise<Gender | null> {
		const genderRepository = manager
			? manager.getRepository(Gender)
			: this.genderRepository;
		const gender = genderRepository.findOne({ where: { id } });
		if (!gender) {
			throw new NotFoundException(`Gender with id ${id} not found`);
		}
		return gender;
	}

	async findCityById(
		id: number,
		manager?: EntityManager,
	): Promise<City | null> {
		const cityRepository = manager
			? manager.getRepository(City)
			: this.cityRepository;
		const city = cityRepository.findOne({ where: { id } });
		if (!city) {
			throw new NotFoundException(`City with id ${id} not found`);
		}
		return city;
	}

	async findCitiesByProvince(provinceId: number): Promise<City[]> {
		const cities = await this.cityRepository.find({
			where: { province: { id: provinceId } },
		});
		if (!cities) {
			throw new NotFoundException(
				`No cities found for province with id ${provinceId}`,
			);
		}
		return cities.sort((a, b) => a.name.localeCompare(b.name));
	}

	async findProvinceById(
		id: number,
		manager?: EntityManager,
	): Promise<Province | null> {
		const provinceRepository = manager
			? manager.getRepository(Province)
			: this.provinceRepository;
		const province = await provinceRepository.findOne({ where: { id } });
		if (!province) {
			throw new NotFoundException(`Province with id ${id} not found`);
		}
		return province;
	}

	async findGroupById(
		id: number,
		manager?: EntityManager,
	): Promise<Group | null> {
		const groupRepository = manager
			? manager.getRepository(Group)
			: this.groupRepository;
		const group = await groupRepository.findOne({ where: { id } });
		if (!group) {
			throw new NotFoundException(`Group with id ${id} not found`);
		}
		return group;
	}

	async updateGender(
		id: number,
		updateGenderDto: Partial<Gender>,
	): Promise<Gender> {
		const gender = await this.findGenderById(id);
		if (!gender) {
			throw new NotFoundException(`Gender with id ${id} not found`);
		}
		await this.genderRepository.update(id, updateGenderDto);
		Object.assign(gender, updateGenderDto);
		return gender;
	}

	async updateCity(
		id: number,
		updateCityDto: Partial<City>,
	): Promise<City> {
		const city = await this.findCityById(id);
		if (!city) {
			throw new NotFoundException(`City with id ${id} not found`);
		}
		await this.cityRepository.update(id, updateCityDto);
		Object.assign(city, updateCityDto);
		return city;
	}

	async updateProvince(
		id: number,
		updateProvinceDto: Partial<Province>,
	): Promise<Province> {
		const province = await this.findProvinceById(id);
		if (!province) {
			throw new NotFoundException(`Province with id ${id} not found`);
		}
		await this.provinceRepository.update(id, updateProvinceDto);
		Object.assign(province, updateProvinceDto);
		return province;
	}

	async updateGroup(
		id: number,
		updateGroupDto: Partial<Group>,
	): Promise<Group> {
		const group = await this.findGroupById(id);
		if (!group) {
			throw new NotFoundException(`Group with id ${id} not found`);
		}
		await this.groupRepository.update(id, updateGroupDto);
		Object.assign(group, updateGroupDto);
		return group;
	}

	async removeGender(id: number): Promise<void> {
		const result = await this.genderRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Gender with id ${id} not found`);
		}
	}

	async removeCity(id: number): Promise<void> {
		const result = await this.cityRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`City with id ${id} not found`);
		}
	}

	async removeProvince(id: number): Promise<void> {
		const result = await this.provinceRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Province with id ${id} not found`);
		}
	}

	async removeGroup(id: number): Promise<void> {
		const result = await this.groupRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Group with id ${id} not found`);
		}
	}

	async importProvincesAndLocalities(): Promise<void> {
		const base = ''; // HttpModule already has baseURL

		// 1) Provinces
		try {
			const provincesResp = await firstValueFrom(
				this.http.get('/provincias.json'),
			);
			const provinces = provincesResp.data?.provincias ?? [];

			provinces.map(async (dto) => {
				const exists = await this.provinceRepository.findOne({
					where: { externalId: dto.id },
				});

				console.log('Checking province:', dto.nombre, 'Exists:', !!exists);

				if (!exists) {
					const province = this.provinceRepository.create({
						externalId: dto.id,
						name: dto.nombre,
					});
					await this.provinceRepository.save(province);
				}
			});
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException(
				'Error saving provinces',
			);
		}

		// 2) localities
		try {
			const localitiesResp = await firstValueFrom(
				this.http.get('/localidades.json'),
			);
			const localities = localitiesResp.data?.localidades ?? [];

			for (const dto of localities) {
				const exists = await this.cityRepository.findOne({
					where: { externalId: dto.id },
				});

				console.log('Checking city:', dto.nombre, 'Exists:', !!exists);

				if (!exists) {
					const province = await this.provinceRepository.findOne({
						where: { externalId: dto.provincia.id },
					});

					if (!province) continue;

					const city = this.cityRepository.create({
						externalId: dto.id,
						name: dto.nombre,
					});
					city.province = province;

					await this.cityRepository.save(city);
				}
			}
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException(
				'Error saving localities',
			);
		}
	}
}
