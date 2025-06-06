import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	JoinColumn,
	OneToOne,
} from 'typeorm';
import { Usuario } from '../../auth/entities/usuario.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';

@Entity('cuidadores')
export class Cuidador {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	descripcion: string;

	@Column()
	precioXHora: number;

	@Column('simple-array', { nullable: true })
	especialidades: string[];

	@Column({ default: true })
	disponible: boolean;

	@OneToMany(() => Reserva, (reserva) => reserva.cuidador, { cascade: true })
	reservas: Reserva[];

	@OneToOne(() => Usuario, (usuario) => usuario.cuidador)
	@JoinColumn()
	usuario: Usuario;
}
