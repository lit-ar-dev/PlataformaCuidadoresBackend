import {
	AbilityBuilder,
	MongoAbility,
	createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = 'all' | string;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class AbilityFactory {
	createForUser(user: User) {
		const { can, build } = new AbilityBuilder<AppAbility>(
			createMongoAbility,
		);

		user.roles?.forEach((role) => {
			role.permissions?.forEach((permission) => {
				const [action, subject] = permission.name.split('.');
				can(action as Actions, subject as Subjects);
			});
		});

		return build({
			detectSubjectType: (item: Record<string, any>) =>
				item.constructor as any,
		});
	}
}
