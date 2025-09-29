import { Provider } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';

export const TEMPORAL_CLIENT = 'TEMPORAL_CLIENT';

export const TemporalProvider: Provider = {
	provide: TEMPORAL_CLIENT,
	useFactory: async () => {
		const address = process.env.TEMPORAL_ADDRESS || (process.env.NODE_ENV === 'local' ? 'localhost:7233' : 'temporal:7233');
		const connection = await Connection.connect({ address });
		return new Client({ connection });
	},
};
