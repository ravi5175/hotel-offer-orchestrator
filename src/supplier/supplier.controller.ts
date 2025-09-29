import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { config } from '../config/config';

@Controller('api')
export class SuppliersController {
    @Get(':supplierId/hotels')
    getSupplierHotels(
        @Param('supplierId') supplierId: string,
        @Query('city') city: string,
    ) {
        const supplier = config.suppliers.find((s) => s.id === supplierId);
        if (!supplier) {
            throw new NotFoundException(`Supplier ${supplierId} not found`);
        }

        // filter by city (case insensitive)
        return supplier.hotels.filter(
            (h) => h.city.toLowerCase() === city.toLowerCase(),
        );
    }
}
