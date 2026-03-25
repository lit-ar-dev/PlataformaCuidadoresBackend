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
import { PaymentsService } from './payments.service';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import * as crypto from 'crypto';
import { Response } from 'express';

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) {}

	@Post('mp/create-preference')
	@Roles('admin', 'client')
	@UseGuards(JwtAuthGuard, RolesGuard)
	async createPreference(@Body() createDto: CreatePreferenceDto) {
		const preference = await this.paymentsService.createPreference(createDto);
		return {
			init_point: preference.init_point,
			preference_id: preference.id,
		};
	}

	@Get('success')
	success() {
		return { message: 'Payment approved successfully' };
	}

	@Get('failure')
	failure() {
		return { message: 'Payment failed or cancelled' };
	}

	@Get('pending')
	pending() {
		return { message: 'Payment is pending' };
	}

	@Post('mp/webhook')
	async handleWebhook(
		@Headers() headers: Record<string, string>,
		@Body() payload: any,
		@Res() res: Response,
	) {
		console.log('[MP Webhook] Headers:', headers);
		console.log('[MP Webhook] Payload:', payload);
		// 1) Validate that the key is configured
		const secret = process.env.MP_WEBHOOK_KEY;
		if (!secret) {
			return res
				.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.send('Webhook secret key not configured');
		}

		// 2) Extract headers
		const xSignature = headers['x-signature'];
		const xRequestId = headers['x-request-id'];
		if (!xSignature || !xRequestId) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send('Missing required headers');
		}

		// 3) Parse ts and v1 from x-signature
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

		// 4) Generate the manifest according to MercadoPago
		//    id:<data.id>;request-id:<x-request-id>;ts:<ts>;
		const dataId = payload?.data?.id || payload?.id;
		if (!dataId) {
			return res
				.status(HttpStatus.BAD_REQUEST)
				.send('Missing payload.data.id');
		}
		const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

		console.log('[MP Webhook] Manifest:', manifest);

		// 5) Calculate HMAC-SHA256 and compare
		const sha = crypto
			.createHmac('sha256', secret)
			.update(manifest)
			.digest('hex');

		if (sha !== v1) {
			return res.status(HttpStatus.BAD_REQUEST).send('Invalid signature');
		}

		// 6) Respond OK to avoid retries
		return res.status(HttpStatus.OK).send('OK');
	}
}
