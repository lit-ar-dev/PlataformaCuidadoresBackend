import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Person } from 'src/persons/entities/person.entity';
import { Role } from 'src/auth/entities/role.entity';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {}

	async create(
		createUserDto: CreateUserDto,
		person: Person,
		roles?: Role[],
		manager?: EntityManager,
	): Promise<User> {
		const userRepository = manager
			? manager.getRepository(User)
			: this.userRepository;
		createUserDto.email = createUserDto.email.toLowerCase();
		const user = userRepository.create(createUserDto);
		user.person = person;
		if (roles) {
			user.roles = roles;
		}
		return userRepository.save(user);
	}

	async findAll(): Promise<User[]> {
		return this.userRepository.find({ relations: ['person', 'roles'] });
	}

	async findOne(id: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['person', 'roles'],
		});
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}
		return user;
	}

	async findOneWithRolesAndPerms(id: string): Promise<User> {
		const user = await this.userRepository.findOne({
			where: { id },
			relations: ['person', 'roles', 'roles.permissions'],
			select: {
				id: true,
				person: {
					name: true,
					lastName: true,
				},
				email: true,
				roles: {
					id: true,
					name: true,
					permissions: {
						id: true,
						name: true,
					},
				},
			},
		});
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}
		return user;
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = await this.userRepository.findOne({
			where: { email },
			relations: ['person', 'roles'],
		});
		if (!user) {
			throw new NotFoundException(
				`User with email ${email} not found`,
			);
		}
		return user;
	}

	async update(
		id: string,
		updateUserDto: Partial<CreateUserDto>,
	): Promise<User> {
		const user = await this.findOne(id);
		if (!user) {
			throw new NotFoundException(`User with id ${id} not found`);
		}
		Object.assign(user, updateUserDto);
		return this.userRepository.save(user);
	}

	async remove(id: string): Promise<void> {
		const result = await this.userRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`User with id ${id} not found`);
		}
	}

	async uploadPhoto(photoUrl: string, userId: string): Promise<User> {
		const user = await this.findOne(userId);
		user.photoUrl = photoUrl;
		return this.userRepository.save(user);
	}
}
