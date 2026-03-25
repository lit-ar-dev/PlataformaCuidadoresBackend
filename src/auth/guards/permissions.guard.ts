import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AbilityFactory } from '../ability.factory';
import { Reflector } from '@nestjs/core';

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';

@Injectable()
export class PermissionsGuard implements CanActivate {
	constructor(
		private abilityFactory: AbilityFactory,
		private reflector: Reflector,
	) {}

	canActivate(context: ExecutionContext): Promise<boolean> | boolean {
		const meta = this.reflector.getAllAndOverride<{
			action: Actions;
			subject: string;
		}>('permissions', [context.getHandler(), context.getClass()]);
		if (!meta) return true;

		const { action, subject } = meta;
		const req = context.switchToHttp().getRequest();
		const user = req.user;
		if (!user) return false;
		const ability = this.abilityFactory.createForUser(user);
		return ability.can(action, subject);
	}
}
