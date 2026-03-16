import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Inventory } from './entities/inventory.entity';
import { InventoryMemoryStore } from './inventory-memory.store';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory])
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryMemoryStore],
  exports: [InventoryService],
})
export class InventoryModule {}
