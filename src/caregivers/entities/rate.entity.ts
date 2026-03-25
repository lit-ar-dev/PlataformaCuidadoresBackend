import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { Caregiver } from './caregiver.entity';
import { Group } from '../../utilities/entities/group.entity';
import { Service } from './service.entity';

@Entity('rates')
export class Rate {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	price: number;

	@ManyToOne(() => Group, (group) => group.rates)
	group: Group;

	@ManyToMany(() => Service, (service) => service.rates)
	@JoinTable({
		name: 'rates_x_services',
		joinColumn: { name: 'priceId', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'serviceId', referencedColumnName: 'id' },
	})
	services: Service[];

	@ManyToOne(() => Caregiver, (caregiver) => caregiver.rates)
	caregiver: Caregiver;
}
