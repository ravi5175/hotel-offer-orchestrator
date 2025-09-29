import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
	imports: [HttpModule, DatabaseModule],
	controllers: [HealthController],
	providers: [HealthService],
})
export class HealthModule {}
