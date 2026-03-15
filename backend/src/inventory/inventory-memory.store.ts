import { Inventory, InventoryStatus } from './entities/inventory.entity';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InventoryMemoryStore {
  private dataFile = path.join(process.cwd(), 'inventory_data.json');
  private items: Map<string, Inventory> = new Map();

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(this.dataFile)) {
      try {
        const raw = fs.readFileSync(this.dataFile, 'utf8');
        const list = JSON.parse(raw);
        list.forEach((item: any) => {
          this.items.set(item.id, item);
        });
      } catch (e) {
        console.error('Failed to load inventory data:', e);
      }
    }
  }

  private save() {
    try {
      const list = Array.from(this.items.values());
      fs.writeFileSync(this.dataFile, JSON.stringify(list, null, 2));
    } catch (e) {
      console.error('Failed to save inventory data:', e);
    }
  }

  async findAll(): Promise<Inventory[]> {
    return Array.from(this.items.values()).filter(i => !i.isDeleted);
  }

  async findOne(id: string): Promise<Inventory | undefined> {
    const item = this.items.get(id);
    return (item && !item.isDeleted) ? item : undefined;
  }

  async findOneBySku(sku: string): Promise<Inventory | undefined> {
    return Array.from(this.items.values()).find(i => i.sku === sku && !i.isDeleted);
  }

  async saveItem(item: Inventory): Promise<Inventory> {
    if (!item.id) {
      item.id = Math.random().toString(36).substr(2, 9);
    }
    this.items.set(item.id, item);
    this.save();
    return item;
  }

  async remove(id: string) {
    const item = this.items.get(id);
    if (item) {
      item.isDeleted = true;
      this.save();
    }
  }
}
