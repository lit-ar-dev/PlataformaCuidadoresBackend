import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.get<string[]>(
			'roles',
			context.getHandler(),
		);

		if (!requiredRoles) return true;

		const req = context.switchToHttp().getRequest();

		return req.user.roles?.some(
			(role: { name: string; permissions: string[] }) => {
				const formattedRole = role.name.toLowerCase();
				return requiredRoles.includes(formattedRole);
			},
		);
	}
}
