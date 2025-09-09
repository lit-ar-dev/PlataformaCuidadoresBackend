import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AbilityFactory } from '../ability.factory';
import { Reflector } from '@nestjs/core';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

@Injectable()
export class PermisosGuard implements CanActivate {
	constructor(
		private abilityFactory: AbilityFactory,
		private reflector: Reflector,
	) {}

	canActivate(context: ExecutionContext): Promise<boolean> | boolean {
		const meta = this.reflector.getAllAndOverride<{
			action: Actions;
			subject: string;
		}>('permisos', [context.getHandler(), context.getClass()]);
		if (!meta) return true;

		const { action, subject } = meta;
		const req = context.switchToHttp().getRequest();
		const usuario = req.user;
		if (!usuario) return false;
		const ability = this.abilityFactory.createForUser(usuario);
		return ability.can(action, subject);
	}
}
