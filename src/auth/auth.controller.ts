import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Query,
	Res,
	BadRequestException,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthService } from './google-auth-service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly googleAuthService: GoogleAuthService,
		private readonly jwtService: JwtService,
	) {}

	@Post('register')
	async register(@Body() registerDto: RegisterDto) {
		console.log('Register DTO:', registerDto);
		return this.authService.register(registerDto);
	}

	@Post('login')
	async login(@Body() loginDto: LoginDto) {
		return this.authService.login(loginDto);
	}

	@Get('me')
	async me(@Req() req) {
		try {
			const token = req.cookies?.session;
			if (!token) {
				throw new UnauthorizedException('Token inválido o expirado');
			}

			// verify lanza si el token es inválido/expirado
			const payload = this.jwtService.verify(token);

			return { ok: true, exp: payload.exp, iat: payload.iat };
		} catch (err) {
			throw new UnauthorizedException('Token inválido o expirado');
		}
	}

	@Get('roles')
	async getRoles() {
		return this.authService.findAllRolesExceptAdminUser();
	}

	@Get('email-exists/:email')
	async emailExists(@Param('email') email: string) {
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
		// valida redirect_uri (allowlist)
		if (!this.authService.isAllowedRedirect(redirectUri)) {
			throw new BadRequestException('redirect_uri not allowed');
		}
		const { url, state } = this.googleAuthService.generateAuthUrl({
			client,
			redirectUri,
		});
		// guarda state (opcional) o firmalo para verificar luego
		// redirige a google
		return res.redirect(url);
	}

	@Get('google/callback')
	async googleCallback(
		@Query('code') code: string,
		@Query('state') state: string,
		@Res() res: Response,
	) {
		console.log('Google callback', { code, state });
		// validar state (nonce, redirectUri, etc) -> la service hace decode+verify
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
			// mobile: generamos one-time-code
			const otc = await this.authService.createOneTimeCodeForToken(token);
			// redirect a scheme: redirectUri puede ser myapp://auth/callback
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
