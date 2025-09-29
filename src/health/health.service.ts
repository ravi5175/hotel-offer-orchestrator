import { Injectable, Inject } from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import axios from 'axios';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Client as TemporalClient } from '@temporalio/client';
import { config } from '../config/config';
import { REDIS_CLIENT } from '../database/redis.provider';
import { TEMPORAL_CLIENT } from 'src/database/temporal.provider';
import { POSTGRES_POOL } from 'src/database/postgres.provider';

@Injectable()
export class HealthService {
    constructor(
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @Inject(TEMPORAL_CLIENT) private readonly temporal: TemporalClient,
        @Inject(POSTGRES_POOL) private readonly pg: Pool,
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
    ) {}

    async checkRedis() {
        try {
            await this.redis.ping();
            this.logger.log('Redis check OK', HealthService.name);
            return { status: 'ok' };
        } catch (e: any) {
            this.logger.error('Redis check failed', e.stack, HealthService.name);
            return { status: 'error', error: e.message };
        }
    }

    async checkTemporal() {
        try {
            await this.temporal.workflowService.listNamespaces({});
            this.logger.log('Temporal check OK', HealthService.name);
            return { status: 'ok' };
        } catch (e: any) {
            this.logger.error('Temporal check failed', e.stack, HealthService.name);
            return { status: 'error', error: e.message };
        }
    }

    async checkPostgres() {
        try {
            await this.pg.query('SELECT 1');
            this.logger.log('Postgres check OK', HealthService.name);
            return { status: 'ok' };
        } catch (e: any) {
            this.logger.error('Postgres check failed', e.stack, HealthService.name);
            return { status: 'error', error: e.message };
        }
    }

    async checkSupplier(name: string, url: string) {
        try {
            const { data } = await axios.get(url, { timeout: 2000 });
            this.logger.log(
                `Supplier ${name} OK (${Array.isArray(data) ? data.length : 0} hotels)`,
                HealthService.name,
            );
            return { status: 'ok', count: Array.isArray(data) ? data.length : null };
        } catch (e: any) {
            this.logger.error(`Supplier ${name} check failed`, e.stack, HealthService.name);
            return { status: 'error', error: e.message, url: url };
        }
    }

    async checkAll() {
        const baseUrl = 'http://localhost:3000/api';

        const suppliers: Record<string, any> = {};
        for (const s of config.suppliers) {
            suppliers[s.id] = await this.checkSupplier(
                s.name,
                `${baseUrl}${s.url}?city=delhi`,
            );
        }

        return {
            redis: await this.checkRedis(),
            postgres: await this.checkPostgres(),
            temporal: await this.checkTemporal(),
            suppliers,
        };
    }
}
