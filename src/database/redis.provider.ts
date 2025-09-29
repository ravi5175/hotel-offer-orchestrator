import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const RedisProvider: Provider = {
    provide: REDIS_CLIENT,
    useFactory: async () => {
        // redis.provider.ts
        const host = process.env.REDIS_HOST || (process.env.NODE_ENV === 'local' ? 'localhost' : 'redis');
        const port = Number(process.env.REDIS_PORT || 6379);
        const client = new Redis({ host, port });
        client.on('error', (err) => console.error('Redis error', err));
        return client;
    },
};
