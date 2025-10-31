import {
	BadRequestException,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CurrentUsuario } from 'src/auth/guards/current-usuario.guard';

@Controller('usuarios')
export class UsuariosController {
	constructor(private readonly usuarioService: UsuariosService) {}

	@UseGuards(JwtAuthGuard)
	@Post('upload-foto')
	@UseInterceptors(
		FileInterceptor('foto', {
			storage: diskStorage({
				destination: './uploads',
				filename: (req, file, cb) => {
					const ext = file.originalname.split('.').pop();
					const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
					cb(null, name);
				},
			}),
			limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
			fileFilter: (req, file, cb) => {
				if (!file.mimetype.startsWith('image/'))
					return cb(new Error('Sólo imágenes'), false);
				cb(null, true);
			},
		}),
	)
	async uploadFoto(
		@UploadedFile() file: Express.Multer.File | undefined,
		@CurrentUsuario() usuario: { id: string },
	) {
		if (file) {
			const fotoUrl = `/uploads/${file.filename}`;
			return this.usuarioService.uploadFoto(fotoUrl, usuario.id);
		} else {
			throw new BadRequestException('Foto inválida');
		}
	}
}
