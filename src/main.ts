import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as ngrok from 'ngrok';

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
	const url = await ngrok.connect(port);
	console.log(`API is running on: ${url}`);
	process.env.BASE_URL = url;
}
bootstrap();
