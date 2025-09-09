import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Tarifa } from './tarifa.entity';

@Entity('servicios')
export class Servicio {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	nombre: string;

	@ManyToMany(() => Tarifa, (tarifa) => tarifa.servicios)
	tarifas: Tarifa[];
}
