import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { OAuth2Client, OAuth2ClientOptions } from 'google-auth-library';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { PersonasService } from 'src/personas/personas.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { AuthService } from './auth.service';
import * as crypto from 'crypto';

@Injectable()
export class GoogleAuthService {
	private client: OAuth2Client;
	private readonly logger = new Logger(GoogleAuthService.name);
	private secret: string | undefined;
	private redirectUri: string;

	constructor(
		private readonly usuariosService: UsuariosService,
		private readonly personasService: PersonasService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
	) {}

	onModuleInit() {
		try {
			const clientId = this.configService.get<string>(
				'GOOGLE_WEB_CLIENT_ID',
			);
			this.secret = this.configService.get<string>(
				'GOOGLE_WEB_CLIENT_SECRET',
			);
			if (!clientId || !this.secret) {
				console.log('Google OAuth not configured');
				this.logger.error(
					'Google OAuth client ID or secret not configured',
				);
				throw new Error('Google OAuth not configured');
			}
			const config: OAuth2ClientOptions = {
				clientId,
				clientSecret: this.secret,
				redirectUri: this.redirectUri,
			};
			this.client = new OAuth2Client(config);
			this.redirectUri =
				this.configService.get<string>('BASE_URL') +
				'/auth/google/callback';
			console.log('GoogleAuthService redirectUri:', this.redirectUri);
		} catch (error) {
			console.error('Error initializing GoogleAuthService:', error);
			throw error;
		}
	}

	generateAuthUrl({
		client,
		redirectUri,
	}: {
		client: 'web' | 'mobile';
		redirectUri: string;
	}) {
		// state: firmar JSON con HMAC para evitar manipulación
		const stateObj = {
			nonce: crypto.randomBytes(16).toString('hex'),
			ts: Date.now(),
			client,
			redirectUri,
		};
		const stateStr = Buffer.from(JSON.stringify(stateObj)).toString(
			'base64url',
		);
		const url = this.client.generateAuthUrl({
			scope: ['openid', 'email', 'profile'],
			prompt: 'select_account',
			state: stateStr,
			redirect_uri: this.redirectUri,
			response_type: 'code',
		});
		return { url, state: stateStr };
	}

	async verifyIdToken(idToken: string) {
		// Verifica con google-auth-library
		const ticket = await this.client.verifyIdToken({
			idToken,
			audience: this.client._clientId, // o config.GOOGLE_CLIENT_ID
		});
		const payload = ticket.getPayload();
		if (!payload)
			throw new UnauthorizedException('Invalid Google token payload');
		return payload; // contiene email, name, picture, sub, etc.
	}

	/**
	 * Valida/crea usuario a partir del payload de Google y retorna un JWT propio
	 */
	async loginOrCreateFromGoogle(
		code: string,
		state: string,
	): Promise<{ token: string; client: string; redirectUri: string }> {
		// decode state
		const stateJson = JSON.parse(
			Buffer.from(state, 'base64url').toString(),
		);
		console.log('Decoded state:', stateJson);
		// opcional: validate ts, nonce, etc.

		// exchange code por tokens
		const r = await this.client.getToken({
			code,
			redirect_uri: this.redirectUri,
		});
		const tokens = r.tokens; // { id_token, access_token, refresh_token, ... }

		if (!tokens.id_token) throw new Error('no id_token');

		const payload = await this.verifyIdToken(tokens.id_token);
		console.log('Google payload:', payload);
		const email = payload.email;
		if (!email) {
			throw new UnauthorizedException('Google token has no email');
		}

		let usuario: Usuario | null = null;

		try {
			usuario = await this.usuariosService.findByEmail(email);
			console.log('Found existing user by email:', usuario);
		} catch (error) {
			console.log('User not found, will create new:', error);
			const persona = await this.personasService.create({
				nombre: payload.given_name ?? payload.name ?? 'Sin nombre',
				apellido: payload.family_name ?? ' ',
				fechaDeNacimiento: new Date(),
				ciudadId: 1,
			});
			console.log('Created new persona from Google auth:', persona);

			const rolUsuario = await this.authService.findUsuarioRol();

			usuario = await this.usuariosService.create(
				{
					email,
					//fotoUrl: payload.picture ?? undefined,
				},
				persona,
				rolUsuario ? [rolUsuario] : [],
			);
			console.log('Created new user from Google auth:', usuario);
		}

		if (!usuario) {
			throw new UnauthorizedException(
				'No se pudo crear o encontrar el usuario',
			);
		}

		const jwtPayload = {
			sub: usuario.id,
			roles: usuario.roles?.map((r) => r.nombre) ?? [],
		};
		const token = this.jwtService.sign(jwtPayload);
		return {
			token,
			client: stateJson.client,
			redirectUri: stateJson.redirectUri,
		};
	}
}
