import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { OAuth2Client, OAuth2ClientOptions } from 'google-auth-library';
import { UsersService } from 'src/users/users.service';
import { PersonsService } from 'src/persons/persons.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import * as crypto from 'crypto';

@Injectable()
export class GoogleAuthService {
	private client: OAuth2Client;
	private readonly logger = new Logger(GoogleAuthService.name);
	private secret: string | undefined;
	private redirectUri: string;

	constructor(
		private readonly usersService: UsersService,
		private readonly personsService: PersonsService,
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
		// state: sign JSON with HMAC to prevent tampering
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
		// Verify with google-auth-library
		const ticket = await this.client.verifyIdToken({
			idToken,
			audience: this.client._clientId, // or config.GOOGLE_CLIENT_ID
		});
		const payload = ticket.getPayload();
		if (!payload)
			throw new UnauthorizedException('Invalid Google token payload');
		return payload; // contains email, name, picture, sub, etc.
	}

	/**
	 * Validates/creates user from Google payload and returns an internal JWT
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
		// optional: validate ts, nonce, etc.

		// exchange code for tokens
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

		let user: User | null = null;

		try {
			user = await this.usersService.findByEmail(email);
			console.log('Found existing user by email:', user);
		} catch (error) {
			console.log('User not found, will create new:', error);
			const person = await this.personsService.create({
				name: payload.given_name ?? payload.name ?? 'No name',
				lastName: payload.family_name ?? ' ',
				birthDate: new Date(),
				cityId: 1,
			});
			console.log('Created new person from Google auth:', person);

			const roleUser = await this.authService.findUserRole();

			user = await this.usersService.create(
				{
					email,
					//photoUrl: payload.picture ?? undefined,
				},
				person,
				roleUser ? [roleUser] : [],
			);
			console.log('Created new user from Google auth:', user);
		}

		if (!user) {
			throw new UnauthorizedException(
				'Could not create or find the user',
			);
		}

		const jwtPayload = {
			sub: user.id,
			roles: user.roles?.map((r) => r.name) ?? [],
		};
		const token = this.jwtService.sign(jwtPayload);
		return {
			token,
			client: stateJson.client,
			redirectUri: stateJson.redirectUri,
		};
	}
}
