import { Inject, Injectable } from '@nestjs/common';
import { TemporalService } from '../temporal/temporal.service';
import { REDIS_CLIENT } from '../database/redis.provider';
import Redis from 'ioredis';
import { PublicHotel } from '../common/types';

@Injectable()
export class HotelsService {
	constructor(
		private readonly temporalService: TemporalService,
		@Inject(REDIS_CLIENT) private readonly redis: Redis,
	) {}

	private async filterFromRedis(city: string, min?: number, max?: number): Promise<PublicHotel[]> {
		const indexKey = `city:${city}:hotels`;
		const exists = await this.redis.exists(indexKey);
		if (!exists) return [];

		const minScore = min ?? -Infinity;
		const maxScore = max ?? +Infinity;
		const keys = await this.redis.zrangebyscore(indexKey, minScore, maxScore);
		if (!keys.length) return [];

		const pipe = this.redis.pipeline();
		keys.forEach((k) => pipe.hgetall(k));
		const replies = (await pipe.exec()) ?? [];

		const hotels: PublicHotel[] = [];

		for (const reply of replies) {
			if (!Array.isArray(reply)) continue;

			const [err, obj] = reply;

			if (err || !obj) continue;

			const r = obj as Record<string, string>;
			hotels.push({
				name: r.name,
				price: Number(r.price),
				supplier: r.supplier,
				commissionPct: Number(r.commissionPct),
			});
		}

		return hotels;
	}

	async getHotels(city: string, min?: number, max?: number): Promise<PublicHotel[]> {
		const hasFilter = min !== undefined || max !== undefined;

		if (!hasFilter) {
			// No filter: run workflow fresh
			return this.temporalService.runHotelWorkflow(city);
		}

		// Filtered path: check Redis
		let rows = await this.filterFromRedis(city, min, max);
		if (rows.length > 0) return rows;

		// Cache miss: run workflow to populate Redis, then filter again
		await this.temporalService.runHotelWorkflow(city);
		return this.filterFromRedis(city, min, max);
	}
}
