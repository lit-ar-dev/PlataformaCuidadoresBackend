import {
	AbilityBuilder,
	MongoAbility,
	createMongoAbility,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = 'all' | string;

export type AppAbility = MongoAbility<[Actions, Subjects]>;

@Injectable()
export class AbilityFactory {
	createForUser(usuario: Usuario) {
		const { can, build } = new AbilityBuilder<AppAbility>(
			createMongoAbility,
		);

		usuario.roles?.forEach((rol) => {
			rol.permisos?.forEach((permiso) => {
				const [action, subject] = permiso.nombre.split('.');
				can(action as Actions, subject as Subjects);
			});
		});

		return build({
			detectSubjectType: (item: Record<string, any>) =>
				item.constructor as any,
		});
	}
}
