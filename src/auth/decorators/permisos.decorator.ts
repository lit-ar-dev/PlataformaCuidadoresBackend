import { SetMetadata } from '@nestjs/common';
import { Actions } from '../ability.factory';

export const PERMISOS_KEY = 'permisos';
export const Permisos = (action: Actions, subject: string) =>
	SetMetadata(PERMISOS_KEY, { action, subject });
