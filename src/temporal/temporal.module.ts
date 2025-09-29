import { Module } from '@nestjs/common';
import { TemporalService } from './temporal.service';
import { DatabaseModule } from '../database/database.module';

@Module({
	imports: [DatabaseModule],
	providers: [TemporalService],
	exports: [TemporalService],
})
export class TemporalModule {}
