import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	JoinColumn,
	OneToOne,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { Tarifa } from './tarifa.entity';
import { Tag } from './tag.entity';

@Entity('cuidadores')
export class Cuidador {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	descripcion: string;

	@Column('simple-array', { nullable: true })
	experiencia: string[];

	@Column('simple-array', { nullable: true })
	formacion: string[];

	@OneToMany(() => Reserva, (reserva) => reserva.cuidador)
	reservas: Reserva[];

	@OneToOne(() => Usuario, (usuario) => usuario.cuidador)
	@JoinColumn()
	usuario: Usuario;

	@OneToMany(() => Tarifa, (tarifa) => tarifa.cuidador)
	tarifas: Tarifa[];

	@ManyToMany(() => Tag, (tag) => tag.cuidadores)
	@JoinTable({
		name: 'tags_x_cuidadores',
		joinColumn: { name: 'cuidadorId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
	})
	tags: Tag[];
}
