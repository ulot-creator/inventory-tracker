import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'inventory_tracker.sqlite',
  entities: [Inventory],
  synchronize: true, // Auto-create tables in local SQLite
  logging: true,     // Helpful for local debugging
};
