import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToOne,
	ManyToOne,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { City } from 'src/utilities/entities/city.entity';
import { Gender } from 'src/utilities/entities/gender.entity';

@Entity('persons')
export class Person {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	name: string;

	@Column()
	lastName: string;

	@Column({ type: 'date', nullable: true })
	birthDate?: Date | null;

	@Column({ type: 'varchar', nullable: true })
	phone?: string | null;

	@OneToOne(() => User, (user) => user.person)
	user: User;

	@ManyToOne(() => City, (city) => city.persons)
	city: City;

	@ManyToOne(() => Gender, (gender) => gender.persons)
	gender: Gender;
}
