import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Inventory } from '../inventory/entities/inventory.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: (process.env.DB_TYPE as any) || (process.env.POSTGRES_URL ? 'postgres' : 'sqlite'),
  database: process.env.DB_NAME || process.env.POSTGRES_DATABASE || 'inventory_tracker.sqlite',
  host: process.env.DB_HOST || process.env.POSTGRES_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : (process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT) : undefined),
  username: process.env.DB_USERNAME || process.env.POSTGRES_USER,
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  entities: [Inventory],
  synchronize: true, // Auto-create tables (use migrations for production in real-world)
  logging: process.env.NODE_ENV !== 'production',
  ssl: (process.env.DB_SSL === 'true' || !!process.env.POSTGRES_URL) ? { rejectUnauthorized: false } : false,
};
