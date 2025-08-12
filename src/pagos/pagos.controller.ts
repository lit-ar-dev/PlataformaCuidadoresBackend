import {
	Controller,
	Post,
	Body,
	UseGuards,
	Get,
	Res,
	Headers,
	HttpStatus,
} from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePreferenciaDto } from './dto/create-preferencia.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../auth/entities/usuario.entity';
import * as crypto from 'crypto';
import { Response } from 'express';

@Controller('pagos')
export class PagosController {
	constructor(private readonly pagosService: PagosService) {}

	@Post('mp/crear-preferencia')
	@Roles(UserRole.ADMIN, UserRole.CLIENTE)
	@UseGuards(JwtAuthGuard, RolesGuard)
	async crearPreferencia(@Body() createDto: CreatePreferenciaDto) {
		const preference = await this.pagosService.crearPreferencia(createDto);
		return {
			init_point: preference.init_point,
			preference_id: preference.id,
		};
	}

	@Get('success')
	success() {
		return { message: 'Pago aprobado con éxito' };
	}

	@Get('failure')
	failure() {
		return { message: 'Pago fallido o cancelado' };
	}

	@Get('pending')
	pending() {
		return { message: 'Pago en estado pendiente' };
	}

	@Post('mp/webhook')
	async handleWebhook(
		@Headers() headers: Record<string, string>,
		@Body() payload: any,
		@Res() res: Response,
	) {
		console.log('[MP Webhook] Headers:', headers);
		console.log('[MP Webhook] Payload:', payload);
		// 1) Validar que esté configurada la clave
		const secret = process.env.MP_WEBHOOK_KEY;
		if (!secret) {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.send('Webhook secret key not configured');
		}

		// 2) Extraer cabeceras
		const xSignature = headers['x-signature'];
		const xRequestId = headers['x-request-id'];
		if (!xSignature || !xRequestId) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send('Missing required headers');
		}

		// 3) Parsear ts y v1 de x-signature
		let ts: string | undefined;
		let v1: string | undefined;
		for (const part of xSignature.split(',')) {
			const [key, value] = part.split('=').map((s) => s.trim());
			if (key === 'ts') ts = value;
			if (key === 'v1') v1 = value;
		}
		if (!ts || !v1) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send('Invalid signature format');
		}

		// 4) Generar el “manifest” según Mercadopago
		//    id:<data.id>;request-id:<x-request-id>;ts:<ts>;
		const dataId = payload?.data?.id || payload?.id;
		if (!dataId) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send('Missing payload.data.id');
		}
		const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

		console.log('[MP Webhook] Manifest:', manifest);

		// 5) Calcular HMAC-SHA256 y comparar
		const sha = crypto
			.createHmac('sha256', secret)
			.update(manifest)
			.digest('hex');

		if (sha !== v1) {
			return res.status(HttpStatus.BAD_REQUEST).send('Invalid signature');
		}

		// 6) Responder OK para evitar reintentos
		return res.status(HttpStatus.OK).send('OK');
	}
}
