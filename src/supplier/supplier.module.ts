import { Module } from '@nestjs/common';
import { SuppliersController } from './supplier.controller';

@Module({
    controllers: [SuppliersController],
})
export class SuppliersModule {}
