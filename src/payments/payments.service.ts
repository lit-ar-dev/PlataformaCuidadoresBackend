import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CreatePreferenceDto } from './dto/create-preference.dto';

@Injectable()
export class PaymentsService {
	private mercadoPago: Preference;

	constructor(private readonly configService: ConfigService) {
		const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
		if (!accessToken) {
			throw new Error(
				'MP_ACCESS_TOKEN is not defined in environment variables',
			);
		}

		const client = new MercadoPagoConfig({
			accessToken,
			options: {
				integratorId: 'dev_24c65fb163bf11ea96500242ac130004',
			},
		});
		this.mercadoPago = new Preference(client);
	}

	async createPreference(createDto: CreatePreferenceDto) {
		const { total, description } = createDto;
		if (total <= 0) {
			throw new BadRequestException('Amount must be greater than zero');
		}

		const ngrok_url = process.env.BASE_URL || 'http://localhost:3000';

		const preference = {
			items: [
				{
					id: '1111',
					title: description,
					description:
						'Mobile e-commerce store device',
					picture_url:
						'https://flowbite.com/docs/images/examples/image-1@2x.jpg',
					quantity: 1,
					unit_price: total,
				},
			],
			payment_methods: {
				excluded_payment_methods: [{ id: 'visa' }],
				installments: 6,
			},
			back_urls: {
				success: `${ngrok_url}/payments/success`,
				failure: `${ngrok_url}/payments/failure`,
				pending: `${ngrok_url}/payments/pending`,
			},
			auto_return: 'approved',
			external_reference: 'damian-200@live.com.ar',
			notification_url: `${ngrok_url}/payments/mp/webhook`,
		};

		const response = await this.mercadoPago.create({ body: preference });
		return response;
	}
}
