import Redis from 'ioredis';
import { config } from '../../config/config';
import { cityIndexKey, hotelHashKey} from '../../common/keys';
import { PublicHotel } from '../../common/types';


export type PricedHotel = {
	name: string;
	price: number;
	commissionPct: number;
	supplier: string;
};

export async function dedupeAndPickBest(hotels: PricedHotel[]): Promise<PublicHotel[]> {
	const byName = new Map<string, PublicHotel>();

	for (const h of hotels) {
		const candidate: PublicHotel = {
			name: h.name,
			price: h.price,
			supplier: h.supplier,
			commissionPct: h.commissionPct,
		};
		const existing = byName.get(h.name);
		if (!existing || candidate.price < existing.price) {
			byName.set(h.name, candidate);
		}
	}

	return Array.from(byName.values()).sort((a, b) => a.price - b.price);
}

export async function saveToRedis(city: string, hotels: PublicHotel[], ttlSeconds?: number): Promise<void> {
	const client = new Redis({ host: config.redis.host, port: config.redis.port });
	const indexKey = cityIndexKey(city);

	try {
		const pipe = client.multi();
		pipe.del(indexKey);

		for (const h of hotels) {
		const hKey = hotelHashKey(city, h.name);
		pipe.hset(hKey, {
			name: h.name,
			price: String(h.price),
			supplier: h.supplier,
			commissionPct: String(h.commissionPct),
		});
		if (ttlSeconds && ttlSeconds > 0) {
			pipe.expire(hKey, ttlSeconds);
		}
		pipe.zadd(indexKey, h.price, hKey);
		}

		if (ttlSeconds && ttlSeconds > 0) {
			pipe.expire(indexKey, ttlSeconds);
		}

		await pipe.exec();
		console.log('redis.save.ok', { city, count: hotels.length });
	} catch (err: any) {
		console.log('redis.save.err', { city, msg: err?.message });
		throw err;
	} finally {
		client.disconnect();
	}
}

/**
 * Query hotels from Redis using price range.
 * Used when API request has minPrice / maxPrice.
 */
export async function queryFromRedis(city: string, min?: number, max?: number): Promise<PublicHotel[]> {
	const client = new Redis({ host: config.redis.host, port: config.redis.port });
	const indexKey = cityIndexKey(city);

	try {
		const exists = await client.exists(indexKey);
		if (!exists) return [];

		const minScore = min ?? -Infinity;
		const maxScore = max ?? +Infinity;
		const keys = await client.zrangebyscore(indexKey, minScore, maxScore);
		if (keys.length === 0) return [];

		const pipe = client.pipeline();
		keys.forEach((k) => pipe.hgetall(k));
		const replies = (await pipe.exec()) ?? [];
		const out: PublicHotel[] = [];

		for (const reply of replies) {
		if (!Array.isArray(reply)) continue;
		const [err, obj] = reply;
		if (err || !obj) continue;

		const r = obj as Record<string, string>;
		out.push({
			name: r.name,
			price: Number(r.price),
			supplier: r.supplier,
			commissionPct: Number(r.commissionPct),
		});
		}

		console.log('redis.query.ok', { city, count: out.length, min, max });
		return out;
	} catch (err: any) {
		console.log('redis.query.err', { city, msg: err?.message });
		throw err;
	} finally {
		client.disconnect();
	}
}

export async function invalidateCityCache(city: string): Promise<void> {
	const client = new Redis({ host: config.redis.host, port: config.redis.port });
	try {
		await client.del(cityIndexKey(city));
		console.log('redis.invalidate.ok', { city });
	} catch (err: any) {
		console.log('redis.invalidate.err', { city, msg: err?.message });
		throw err;
	} finally {
		client.disconnect();
	}
}
