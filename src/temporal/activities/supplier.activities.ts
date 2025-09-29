import axios from 'axios';
import { config } from '../../config/config';
import { SupplierHotel } from '../../common/types';
import { PricedHotel } from './hotel.activities';

export async function fetchAllSuppliersFlat(city: string): Promise<PricedHotel[]> {
	const flat: PricedHotel[] = [];

	for (const supplier of config.suppliers) {
		// since we’re mocking, just read supplier.hotels from config
		const hotels = supplier.hotels.filter(
		(h) => h.city.toLowerCase() === city.toLowerCase(),
		);

		for (const h of hotels) {
		flat.push({
			name: h.name,
			price: h.price,
			commissionPct: h.commissionPct,
			supplier: supplier.name, // 👈 attach supplier name
		});
		}
	}

	return flat;
}
