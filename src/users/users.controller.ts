import {
	BadRequestException,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CurrentUser } from 'src/auth/guards/current-user.guard';

@Controller('users')
export class UsersController {
	constructor(private readonly userService: UsersService) {}

	@UseGuards(JwtAuthGuard)
	@Post('upload-photo')
	@UseInterceptors(
		FileInterceptor('photo', {
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
					return cb(new Error('Only images'), false);
				cb(null, true);
			},
		}),
	)
	async uploadPhoto(
		@UploadedFile() file: Express.Multer.File | undefined,
		@CurrentUser() user: { id: string },
	) {
		if (file) {
			const photoUrl = `/uploads/${file.filename}`;
			return this.userService.uploadPhoto(photoUrl, user.id);
		} else {
			throw new BadRequestException('Invalid photo');
		}
	}
}
