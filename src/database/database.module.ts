import { Module, Post } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { TemporalProvider } from './temporal.provider';
import { PostgresProvider } from './postgres.provider';

@Module({
	providers: [RedisProvider, TemporalProvider, PostgresProvider],
	exports: [RedisProvider, TemporalProvider, PostgresProvider],
})
export class DatabaseModule {}
