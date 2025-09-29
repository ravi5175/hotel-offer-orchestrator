import { Controller, Get, Query } from '@nestjs/common';
import { HotelsService } from './hotel.service';

function toNum(v?: string): number | undefined {
	if (v === undefined) return undefined;
	const n = Number(v);
	return Number.isFinite(n) ? n : undefined;
}

@Controller('api')
export class HotelsController {
	constructor(private readonly hotelsService: HotelsService) {}

	@Get('hotels')
	async getHotels(
		@Query('city') city = 'delhi',
		@Query('minPrice') minPrice?: string,
		@Query('maxPrice') maxPrice?: string,
	) {
		const min = toNum(minPrice);
		const max = toNum(maxPrice);
		return this.hotelsService.getHotels(city, min, max);
	}
}
