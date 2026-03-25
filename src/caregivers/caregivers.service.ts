import { FindCaregiversDto } from './dto/find-caregivers.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { Caregiver } from './entities/caregiver.entity';
import { CreateCaregiverDto } from './dto/create-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { User } from 'src/users/entities/user.entity';
import { Tag } from './entities/tag.entity';
import { Rate } from './entities/rate.entity';
import { Service } from './entities/service.entity';
import { UtilitiesService } from 'src/utilities/utilities.service';
import { In } from 'typeorm';

@Injectable()
export class CaregiversService {
	constructor(
		@InjectRepository(Caregiver)
		private readonly caregiverRepository: Repository<Caregiver>,
		@InjectRepository(Tag)
		private readonly tagRepository: Repository<Tag>,
		@InjectRepository(Service)
		private readonly serviceRepository: Repository<Service>,
		@InjectRepository(Rate)
		private readonly rateRepository: Repository<Rate>,
		private readonly utilitiesService: UtilitiesService,
	) {}

	async create(
		createCaregiverDto: CreateCaregiverDto,
		user: User,
		manager?: EntityManager,
	): Promise<Caregiver> {
		const caregiverRepository = manager
			? manager.getRepository(Caregiver)
			: this.caregiverRepository;
		const tagRepository = manager
			? manager.getRepository(Tag)
			: this.tagRepository;
		const serviceRepository = manager
			? manager.getRepository(Service)
			: this.serviceRepository;
		const rateRepository = manager
			? manager.getRepository(Rate)
			: this.rateRepository;

		const { rates = [], tags = [], ...restDto } = createCaregiverDto;

		const caregiver = caregiverRepository.create(restDto);
		caregiver.user = user;

		if (!caregiver.rates) caregiver.rates = [];
		if (!caregiver.tags) caregiver.tags = [];

		for (const rateByServiceDto of rates) {
			const { groupId, services = [], ...price } = rateByServiceDto;
			const group = await this.utilitiesService.findGroupById(groupId);

			let rate = rateRepository.create(price);
			if (group) {
				rate.group = group;
			}

			rate.services = [];

			for (const serviceName of services) {
				let service = await serviceRepository.findOne({
					where: { name: serviceName },
				});

				if (!service) {
					const newService = serviceRepository.create({
						name: serviceName,
					});
					service = await serviceRepository.save(newService);
				}
				rate.services.push(service);
			}

			rate = await rateRepository.save(rate);
			caregiver.rates.push(rate);
		}

		if (tags && tags.length) {
			for (const tagName of tags) {
				let tagEntity = await tagRepository.findOne({
					where: { name: tagName },
				});
				if (tagEntity) {
					caregiver.tags.push(tagEntity);
				} else {
					const newTag = tagRepository.create({ name: tagName });
					tagEntity = await tagRepository.save(newTag);
					caregiver.tags.push(tagEntity);
				}
			}
		}

		return caregiverRepository.save(caregiver);
	}

	async findAll(filters: FindCaregiversDto) {
		// 1) Use QueryBuilder to filter and paginate, selecting only ids
		const qb = this.caregiverRepository
			.createQueryBuilder('c')
			.leftJoin('c.user', 'u')
			.leftJoin('u.person', 'p')
			.leftJoin('p.city', 'city')
			.leftJoin('city.province', 'province')
			.leftJoin('c.tags', 'tag')
			.leftJoin('c.rates', 'r')
			.leftJoin('r.group', 'g')
			.leftJoin('r.services', 'srv')
			.leftJoin('p.gender', 'gender');

		if (filters.name) {
			const name = `%${filters.name.toLowerCase()}%`;
			qb.andWhere(
				'(p.name ILIKE :name OR p.lastName ILIKE :name)',
				{ name },
			);
		}
		if (filters.city) {
			qb.andWhere('city.name = :city', { city: filters.city });
		}
		if (filters.province) {
			qb.andWhere('province.name = :province', {
				province: filters.province,
			});
		}
		if (filters.tags && filters.tags.length > 0) {
			qb.andWhere(new Brackets(qbInner => {
				(filters.tags ?? []).forEach((tag, index) => {
					qbInner.orWhere(`tag.name ILIKE :tag_${index}`, { 
						[`tag_${index}`]: `%${tag}%` 
					});
				});
			}));
		}

		if (filters.services && filters.services.length > 0) {
			qb.andWhere(new Brackets(qbInner => {
				(filters.services ?? []).forEach((service, index) => {
					qbInner.orWhere(`srv.name ILIKE :service_${index}`, { 
						[`service_${index}`]: `%${service}%` 
					});
				});
			}));
		}
		if (filters.minAge !== undefined) {
			const minDateLimit = subYears(new Date(), filters.minAge);
			qb.andWhere('p.birthDate <= :minDateLimit', { minDateLimit });
		}

		if (filters.maxAge !== undefined) {
			const maxDateLimit = subYears(new Date(), filters.maxAge);
			qb.andWhere('p.birthDate >= :maxDateLimit', { maxDateLimit });
		}
		if (filters.gender) {
			qb.andWhere('gender.id = :gender', { gender: filters.gender });
		}
		if (filters.minPrice !== undefined) {
			qb.andWhere('r.price >= :minPrice', {
				minPrice: filters.minPrice,
			});
		}
		if (filters.maxPrice !== undefined) {
			qb.andWhere('r.price <= :maxPrice', {
				maxPrice: filters.maxPrice,
			});
		}
		if (filters.groups && filters.groups.length > 0) {
			qb.andWhere('g.id IN (:...groups)', { groups: filters.groups });
		}

		qb.select('c.id', 'id') // <-- only ids are selected in this query
			.distinct(true);

		// order/pagination for the id list
		/* const limit = Math.min(filters.limit ?? 20, 100);
		const page = Math.max(filters.page ?? 1, 1);
		qb.orderBy('c.createdAt', 'DESC')
			.take(limit)
			.skip((page - 1) * limit);*/

		// fetch rows with ids
		const rawIds = await qb.getRawMany(); // [{ id: 1 }, { id: 2 }, ...]
		const ids = rawIds.map((r) => r.id);

		if (ids.length === 0) {
			// return { data: [], meta: { total: 0, page, limit } };
			return { data: [], meta: { total: 0 } };
		}

		// 2) Fetch only required columns/relations using repository.find()
		const data = await this.caregiverRepository.find({
			where: { id: In(ids) },
			select: {
				id: true,
				description: true,
				user: {
					active: true,
					photoUrl: true,
					person: {
						name: true,
						lastName: true,
						city: { name: true, province: { name: true } },
						gender: { name: true },
					},
				},
				rates: {
					id: true,
					price: true,
					group: { name: true },
					services: { id: true, name: true },
				},
				tags: { id: true, name: true },
			},
			relations: [
				'user',
				'user.person',
				'user.person.gender',
				'user.person.city',
				'tags',
				'rates',
				'rates.services',
				'rates.group',
			],
		});

		// optional: keep `data` ordered like the original `ids` sequence
		const dataOrdered = ids
			.map((id) => data.find((d) => d.id === id))
			.filter(Boolean);

		// total: if you want the global total (without pagination), run a separate count with the same filters
		const totalQb = this.caregiverRepository
			.createQueryBuilder('c')
			.leftJoin('c.user', 'u')
			.leftJoin('u.person', 'p')
			.leftJoin('p.city', 'city');
		// apply the same filters as above...
		const total = await totalQb.getCount();

		//return { data: dataOrdered, meta: { total, page, limit } };
		return { data: dataOrdered, meta: { total } };
	}

	/*async findAll(filters: FindCaregiversDto): Promise<Caregiver[]> {
		return this.caregiverRepository.find({
			select: {
				description: true,
				user: {
					active: true,
					photoUrl: true,
					person: {
						name: true,
						lastName: true,
						city: {
							name: true,
						},
					},
				},
				rates: {
					price: true,
					group: {
						name: true,
					},
					services: {
						name: true,
					},
				},
				tags: {
					name: true,
				},
			},
			relations: [
				'user',
				'user.person',
				'user.person.city',
				'tags',
				'rates',
				'rates.services',
				'rates.group',
			],
		});
	}*/

	async findOne(id: string): Promise<Caregiver> {
		const caregiver = await this.caregiverRepository.findOne({
			where: { id },
			select: {
				id: true,
				description: true,
				training: true,
				experience: true,
				user: {
					active: true,
					photoUrl: true,
					person: {
						id: true,
						name: true,
						lastName: true,
						birthDate: true,
						gender: { name: true },
						city: {
							name: true,
							province: { name: true },
						},
					},
				},
				rates: {
					id: true,
					price: true,
					group: { name: true },
					services: { id: true, name: true },
				},
				tags: { id: true, name: true },
			},
			relations: [
				'user',
				'user.person',
				'user.person.gender',
				'user.person.city',
				'user.person.city.province',
				'tags',
				'rates',
				'rates.services',
				'rates.group',
			],
		});
		console.log('Caregiver found:', caregiver);
		if (!caregiver) {
			throw new NotFoundException(`Caregiver with id ${id} not found`);
		}
		return caregiver;
	}

	async update(
		id: string,
		updateCaregiverDto: UpdateCaregiverDto,
	): Promise<Caregiver> {
		const caregiver = await this.findOne(id);
		if (!caregiver) {
			throw new NotFoundException(`Caregiver with id ${id} not found`);
		}
		Object.assign(caregiver, updateCaregiverDto);
		return this.caregiverRepository.save(caregiver);
	}

	async remove(id: string): Promise<void> {
		const result = await this.caregiverRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Caregiver with id ${id} not found`);
		}
	}
}

function subYears(date: Date, years: number): Date {
	const newDate = new Date(date.getTime());
	newDate.setFullYear(newDate.getFullYear() - years);
	return newDate;
}