import { Provider } from '@nestjs/common';
import { Pool } from 'pg';

export const POSTGRES_POOL = 'POSTGRES_POOL';

export const PostgresProvider: Provider = {
	provide: POSTGRES_POOL,
	useFactory: async () => {
		const client = new Pool({
			// postgres.provider.ts
			host: process.env.POSTGRES_HOST || (process.env.NODE_ENV === 'local' ? 'localhost' : 'postgres'),
			port: Number(process.env.POSTGRES_PORT || 5432),
			user: process.env.POSTGRES_USER || 'temporal',
			password: process.env.POSTGRES_PASSWORD || 'temporal',
			database: process.env.POSTGRES_DB || 'temporal',
		});

		// Test connection
		await client.query('SELECT 1');

		console.log('Connected to Postgres');
		return client;
	},
};
