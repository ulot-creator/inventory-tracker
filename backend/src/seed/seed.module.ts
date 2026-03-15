import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [InventoryModule],
  controllers: [SeedController],
})
export class SeedModule {}
