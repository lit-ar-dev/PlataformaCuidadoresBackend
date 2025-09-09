import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { CreatePreferenciaDto } from './dto/create-preferencia.dto';

@Injectable()
export class PagosService {
	private mercadopago: Preference;

	constructor(private readonly configService: ConfigService) {
		const accessToken = this.configService.get<string>('MP_ACCESS_TOKEN');
		if (!accessToken) {
			throw new Error(
				'MP_ACCESS_TOKEN no está definido en las variables de entorno',
			);
		}

		const client = new MercadoPagoConfig({
			accessToken,
			options: {
				integratorId: 'dev_24c65fb163bf11ea96500242ac130004',
			},
		});
		this.mercadopago = new Preference(client);
	}

	async crearPreferencia(createDto: CreatePreferenciaDto) {
		const { total, descripcion } = createDto;
		if (total <= 0) {
			throw new BadRequestException('El monto debe ser mayor a cero');
		}

		const ngrok_url = process.env.BASE_URL || 'http://localhost:3000';

		const preference = {
			items: [
				{
					id: '1111',
					title: descripcion,
					description:
						'Dispositivo de tienda móvil de comercio electrónico',
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
				success: `${ngrok_url}/pagos/success`,
				failure: `${ngrok_url}/pagos/failure`,
				pending: `${ngrok_url}/pagos/pending`,
			},
			auto_return: 'approved',
			external_reference: 'damian-200@live.com.ar',
			notification_url: `${ngrok_url}/pagos/mp/webhook`,
		};

		const response = await this.mercadopago.create({ body: preference });
		return response;
	}
}
