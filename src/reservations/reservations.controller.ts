import {
	Controller,
	Get,
	Post,
	Patch,
	Param,
	Delete,
	UseGuards,
	Req,
	ForbiddenException,
	Body,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Request } from 'express';

@Controller('reservations')
export class ReservationsController {
	constructor(private readonly reservationsService: ReservationsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Permissions('create', 'reservation')
	async create(createReservationDto: CreateReservationDto, @Req() req: Request) {
		const user = req.user;
		// still need to match user.id with clientId and compare with req.user.id
		return this.reservationsService.create(createReservationDto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async findAll() {
		return this.reservationsService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Permissions('read', 'reservation')
	async findOne(@Param('id') id: string) {
		return this.reservationsService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, PermissionsGuard)
	@Permissions('update', 'reservation')
	async update(
		@Param('id') id: string,
		@Body() updateReservationDto: UpdateReservationDto,
		@Req() req: Request,
	) {
		const reservation = await this.reservationsService.findOne(id);

		const user = req.user;
		const isAdmin = user?.['roles'].includes('admin');
		const isOwner =
			user &&
			[
				reservation.client?.user?.id,
				reservation.caregiver?.user?.id,
			].includes(user['id']);

		if (!isOwner && !isAdmin) {
			throw new ForbiddenException('You cannot modify this reservation');
		}

		return this.reservationsService.update(id, updateReservationDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	async remove(@Param('id') id: string) {
		await this.reservationsService.remove(id);
		return { message: `Reservation ${id} deleted` };
	}
}
