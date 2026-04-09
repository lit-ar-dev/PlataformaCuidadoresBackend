import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Query,
	Res,
	BadRequestException,
	UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthService } from './google-auth-service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './guards/current-user.guard';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly googleAuthService: GoogleAuthService,
	) { }

	@Post('register')
	async register(@Body() registerDto: RegisterDto) {
		console.log('Register DTO:', registerDto);
		return this.authService.register(registerDto);
	}

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		console.log('Login DTO:', loginDto);
		return this.authService.login(loginDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get('me')
	async me(
		@CurrentUser()
		user: {
			id: string;
			name: string;
			email: string;
		},
	) {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
		};
	}

	@Get('roles')
	async getRoles() {
		return this.authService.findAllRolesExceptAdminUser();
	}

	@Get('email-exists/:email')
	async emailExists(@Param('email') email: string) {
		if (!email) throw new BadRequestException('Invalid email');
		return this.authService.emailExists(email.toLowerCase());
	}

	@Get('google')
	async startGoogleAuth(
		@Query('client') client: 'web' | 'mobile',
		@Query('redirect_uri') redirectUri: string,
		@Res() res: Response,
	) {
		console.log('Start Google Auth', { client, redirectUri });
		if (!client) client = 'web';
		// validate redirect_uri (allowlist)
		if (!this.authService.isAllowedRedirect(redirectUri)) {
			throw new BadRequestException('redirect_uri not allowed');
		}
		const { url, state } = this.googleAuthService.generateAuthUrl({
			client,
			redirectUri,
		});
		// store state (optional) or sign it for later verification
		// redirect to Google
		return res.redirect(url);
	}

	@Get('google/callback')
	async googleCallback(
		@Query('code') code: string,
		@Query('state') state: string,
		@Res() res: Response,
	) {
		console.log('Google callback', { code, state });
		// validate state (nonce, redirectUri, etc.) -> service performs decode+verify
		const payload = await this.googleAuthService.loginOrCreateFromGoogle(
			code,
			state,
		);
		const { token, client, redirectUri } = payload;

		if (client === 'web') {
			// set cookie httpOnly
			res.cookie('session', token, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: 1000 * 60 * 60, // 1h
			});
			return res.redirect(redirectUri || '/');
		} else {
			// mobile: generate one-time-code
			const otc = await this.authService.createOneTimeCodeForToken(token);
			// redirect a scheme: redirectUri can be myapp://auth/callback
			const redirectTo = `${redirectUri}${redirectUri.includes('?') ? '&' : '?'}otc=${encodeURIComponent(otc)}`;
			return res.redirect(redirectTo);
		}
	}

	@Post('mobile/complete')
	async mobileComplete(@Body('otc') otc: string) {
		const token = await this.authService.consumeOneTimeCode(otc);
		if (!token) throw new BadRequestException('invalid or expired code');
		return { token };
	}
}
