import { SetMetadata } from '@nestjs/common';
import { Actions } from '../ability.factory';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (action: Actions, subject: string) =>
	SetMetadata(PERMISSIONS_KEY, { action, subject });
