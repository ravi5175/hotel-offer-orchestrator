import { Module } from '@nestjs/common';
import { HotelsController } from './hotel.controller';
import { HotelsService } from './hotel.service';
import { TemporalModule } from '../temporal/temporal.module';
import { DatabaseModule } from '../database/database.module';

@Module({
	imports: [TemporalModule, DatabaseModule],
	controllers: [HotelsController],
	providers: [HotelsService],
	exports: [HotelsService],
})
export class HotelsModule {}
