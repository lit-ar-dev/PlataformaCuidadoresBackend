import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as ngrok from '@ngrok/ngrok';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
	const listener = await ngrok.connect({
		addr: port,
		authtoken_from_env: true,
	});
	const baseUrl = listener.url();

	const allowlist = (process.env.ORIGIN_ALLOWLIST ?? 'http://localhost:8081')
		.split(',')
		.map((o) => o.trim());
	if (baseUrl) {
		process.env.BASE_URL = baseUrl;
		allowlist.push(baseUrl);
	}

	const app = await NestFactory.create(AppModule);

	app.use(
		bodyParser.json({
			verify: (req: any, res, buf) => {
				req.rawBody = buf;
			},
		}),
	);

	app.use(cookieParser());

	app.enableCors({
		origin: (origin, callback) => {
			if (!origin) return callback(null, true);

			if (allowlist.includes(origin)) {
				// IMPORTANTE: pasar el string origin para que la respuesta ponga
				// Access-Control-Allow-Origin: <origin> (no '*')
				callback(null, origin);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true, // permite enviar cookies
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // borra campos que no estén en el DTO
			forbidNonWhitelisted: true, // lanza error si mandan campos extra
			transform: true, // convierte a instancia DTO
			transformOptions: {
				enableImplicitConversion: true, // convierte strings a number/bool
			},
		}),
	);

	console.log(`API is running on: ${baseUrl}`);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
