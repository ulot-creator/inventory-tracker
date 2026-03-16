import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: (process.env.DB_TYPE as any) || 'sqlite',
  database: process.env.DB_NAME || 'inventory_tracker.sqlite',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: [Inventory],
  synchronize: true, // Auto-create tables (use migrations for production in real-world)
  logging: process.env.NODE_ENV !== 'production',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};
