import {
	Controller,
	Post,
	Body,
	UsePipes,
	ValidationPipe,
	Get,
	Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async register(@Body() registerDto: RegisterDto) {
		return this.authService.register(registerDto);
	}

	@Post('login')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Get()
	async findAll() {
		return this.authService.findAll();
	}

	@Get(':id')
	async findOne(@Param('id') id: string) {
		return this.authService.findOne(id);
	}
}
