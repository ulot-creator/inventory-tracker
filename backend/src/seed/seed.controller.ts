import { Controller, Post } from '@nestjs/common';
import { InventoryService } from '../inventory/inventory.service';
import { InventoryStatus } from '../inventory/entities/inventory.entity';

@Controller('seed')
export class SeedController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async seed() {
    const mockData = [
      { sku: 'SKU-001', name: 'Premium Widget', category: 'Electronics', unit: 'pcs', quantity: 50, lowStockThreshold: 10 },
      { sku: 'SKU-002', name: 'Eco-friendly Gadget', category: 'Electronics', unit: 'pcs', quantity: 5, lowStockThreshold: 15 },
      { sku: 'SKU-003', name: 'Sturdy Hammer', category: 'Tools', unit: 'pcs', quantity: 20, lowStockThreshold: 5 },
      { sku: 'SKU-004', name: 'Wireless Mouse', category: 'Electronics', unit: 'pcs', quantity: 3, lowStockThreshold: 10 },
      { sku: 'SKU-005', name: 'Office Chair', category: 'Furniture', unit: 'pcs', quantity: 12, lowStockThreshold: 5 },
      { sku: 'SKU-006', name: 'Standing Desk', category: 'Furniture', unit: 'pcs', quantity: 0, lowStockThreshold: 2 },
      { sku: 'SKU-007', name: 'USB-C Cable', category: 'Accessories', unit: 'pcs', quantity: 100, lowStockThreshold: 20 },
      { sku: 'SKU-008', name: 'Mechanical Keyboard', category: 'Electronics', unit: 'pcs', quantity: 8, lowStockThreshold: 10 },
    ];

    const results = [];
    for (const item of mockData) {
      try {
        const created = await this.inventoryService.create(item);
        results.push({ sku: item.sku, status: 'Created' });
      } catch (error) {
        results.push({ sku: item.sku, status: 'Error/Already Exists', error: error.message });
      }
    }

    return { message: 'Seeding process completed', results };
  }
}
