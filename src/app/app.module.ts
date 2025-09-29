import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from 'src/health/health.module';
import { DatabaseModule } from 'src/database/database.module';
import { SuppliersModule } from 'src/supplier/supplier.module';
import { HotelsModule } from 'src/hotel/hotel.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
    imports: [ LoggerModule, DatabaseModule, HealthModule, SuppliersModule, HotelsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
