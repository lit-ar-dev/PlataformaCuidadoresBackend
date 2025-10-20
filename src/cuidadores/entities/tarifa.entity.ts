import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Cuidador } from './cuidador.entity';
import { Grupo } from '../../utilidades/entities/grupo.entity';
import { Servicio } from './servicio.entity';

@Entity('tarifas')
export class Tarifa {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	precio: number;

	@ManyToOne(() => Grupo, (grupo) => grupo.tarifas)
	grupo: Grupo;

	@ManyToMany(() => Servicio, (servicio) => servicio.tarifas)
	@JoinTable({
		name: 'tarifas_x_servicios',
		joinColumn: { name: 'precioId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'servicioId', referencedColumnName: 'id' },
	})
	servicios: Servicio[];

	@ManyToOne(() => Cuidador, (cuidador) => cuidador.tarifas)
	cuidador: Cuidador;
}
