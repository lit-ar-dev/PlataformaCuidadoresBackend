import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as ngrok from '@ngrok/ngrok';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(
		bodyParser.json({
			verify: (req: any, res, buf) => {
				req.rawBody = buf;
			},
		}),
	);
	await app.listen(process.env.PORT ?? 3000);
	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
	const listener = await ngrok.connect({
		addr: port,
		authtoken_from_env: true,
	});
	const baseUrl = listener.url();
	console.log(`API is running on: ${baseUrl}`);
	if (baseUrl) {
		process.env.BASE_URL = baseUrl;
	}
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
}
bootstrap();
