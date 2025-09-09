import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tarifa } from '../../cuidadores/entities/tarifa.entity';

@Entity('grupos')
export class Grupo {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	nombre: string;

	@OneToMany(() => Tarifa, (tarifa) => tarifa.grupo)
	tarifas: Tarifa[];
}
