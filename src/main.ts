import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as ngrok from '@ngrok/ngrok';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
	const uploadPath = './uploads';
	if (!fs.existsSync(uploadPath))
		fs.mkdirSync(uploadPath, { recursive: true });

	const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
	const baseUrl = process.env.BASE_URL;

	const allowlist = (process.env.ORIGIN_ALLOWLIST ?? 'http://localhost:5173')
		.split(',')
		.map((o) => o.trim());
	if (baseUrl) {
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
				// IMPORTANT: pass the exact origin string so the response sets
				// Access-Control-Allow-Origin: <origin> (not '*')
				callback(null, origin);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		credentials: true, // allow sending cookies
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // remove fields not present in DTO
			forbidNonWhitelisted: true, // throw error on extra fields
			transform: true, // transform into DTO instance
			transformOptions: {
				enableImplicitConversion: true, // convert strings to number/bool
			},
		}),
	);

	console.log(`API is running on: ${baseUrl}`);

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
