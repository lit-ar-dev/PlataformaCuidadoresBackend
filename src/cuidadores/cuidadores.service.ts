import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuidador } from './entities/cuidador.entity';
import { CreateCuidadorDto } from './dto/create-cuidador.dto';
import { UpdateCuidadorDto } from './dto/update-cuidador.dto';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class CuidadoresService {
	constructor(
		@InjectRepository(Cuidador)
		private readonly cuidadorRepository: Repository<Cuidador>,
		private readonly authService: AuthService,
	) {}

	async create(createCuidadorDto: CreateCuidadorDto): Promise<Cuidador> {
		const { descripcion, precioXHora, especialidades, disponible } =
			createCuidadorDto;
		const usuario = await this.authService.findOne(
			createCuidadorDto.usuarioId,
		);
		if (!usuario) {
			throw new NotFoundException(
				`Usuario con id ${createCuidadorDto.usuarioId} no encontrado`,
			);
		}
		const cuidador = this.cuidadorRepository.create({
			descripcion,
			precioXHora,
			especialidades,
			disponible,
			usuario,
		} as Cuidador);
		return this.cuidadorRepository.save(cuidador);
	}

	async findAll(): Promise<Cuidador[]> {
		return this.cuidadorRepository.find({ relations: ['reservas'] });
	}

	async findOne(id: string): Promise<Cuidador> {
		const cuidador = await this.cuidadorRepository.findOne({
			where: { id },
			relations: ['reservas'],
		});
		if (!cuidador) {
			throw new NotFoundException(`Cuidador con id ${id} no encontrado`);
		}
		return cuidador;
	}

	async update(
		id: string,
		updateCuidadorDto: UpdateCuidadorDto,
	): Promise<Cuidador> {
		const cuidador = await this.findOne(id);
		Object.assign(cuidador, updateCuidadorDto);
		return this.cuidadorRepository.save(cuidador);
	}

	async remove(id: string): Promise<void> {
		const result = await this.cuidadorRepository.delete(id);
		if (result.affected === 0) {
			throw new NotFoundException(`Cuidador con id ${id} no encontrado`);
		}
	}
}
