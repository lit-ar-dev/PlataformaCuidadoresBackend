import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	OneToOne,
	JoinColumn,
} from 'typeorm';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Entity('clientes')
export class Cliente {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	domicilio: string;

	@OneToMany(() => Reserva, (reserva) => reserva.cliente)
	reservas: Reserva[];

	@OneToOne(() => Usuario, (usuario) => usuario.cliente)
	@JoinColumn()
	usuario: Usuario;
}
