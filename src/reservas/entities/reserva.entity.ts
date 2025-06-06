import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cuidador } from '../../cuidadores/entities/cuidador.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

export enum EstadoReserva {
	PENDIENTE = 'pendiente',
	CONFIRMADO = 'confirmado',
	COMPLETADO = 'completado',
	CANCELADO = 'cancelado',
}

@Entity('reservas')
export class Reserva {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@ManyToOne(() => Cuidador, (cuidador) => cuidador.reservas, {
		eager: true,
	})
	cuidador: Cuidador;

	@ManyToOne(() => Cliente, (cliente) => cliente.reservas, {
		eager: true,
	})
	cliente: Cliente;

	@Column({ type: 'timestamp' })
	fechaInicio: Date;

	@Column({ type: 'timestamp' })
	fechaFin: Date;

	@Column({
		type: 'enum',
		enum: EstadoReserva,
		default: EstadoReserva.PENDIENTE,
	})
	estado: EstadoReserva;

	@Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
	precioTotal: number;
}
