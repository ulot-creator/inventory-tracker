import { Injectable, ConflictException, NotFoundException, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, InventoryStatus } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { InventoryMemoryStore } from './inventory-memory.store';

@Injectable()
export class InventoryService {
  constructor(
    private readonly memoryStore: InventoryMemoryStore,
  ) {}

  private get useRepo() {
    return false; // Force in-memory for local dev environment
  }

  private determineStatus(qty: number, threshold: number): InventoryStatus {
    if (qty === 0) return InventoryStatus.OUT_OF_STOCK;
    if (qty <= threshold) return InventoryStatus.LOW_STOCK;
    return InventoryStatus.IN_STOCK;
  }

  async create(createDto: CreateInventoryDto): Promise<Inventory> {
    const existing = await this.memoryStore.findOneBySku(createDto.sku);

    if (existing) {
      throw new ConflictException(`Inventory item with SKU ${createDto.sku} already exists.`);
    }

    const item = new Inventory();
    Object.assign(item, createDto);
    item.status = this.determineStatus(item.quantity, item.lowStockThreshold || 10);
    
    return this.memoryStore.saveItem(item);
  }

  async findAll(): Promise<Inventory[]> {
    return this.memoryStore.findAll();
  }

  async findOne(id: string): Promise<Inventory> {
    const item = await this.memoryStore.findOne(id);

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found.`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.findOne(id);
    
    if (updateDto.sku && updateDto.sku !== item.sku) {
      const existingSku = await this.memoryStore.findOneBySku(updateDto.sku);
      if (existingSku) {
        throw new ConflictException(`Inventory item with SKU ${updateDto.sku} already exists.`);
      }
    }

    Object.assign(item, updateDto);
    item.status = this.determineStatus(item.quantity, item.lowStockThreshold);
    return this.memoryStore.saveItem(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id); // Throws 404 if not found
    await this.memoryStore.remove(id);
  }

  async updateQuantity(id: string, quantity: number): Promise<Inventory> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative.');
    }

    const item = await this.findOne(id);
    item.quantity = quantity;
    item.status = this.determineStatus(item.quantity, item.lowStockThreshold);
    return this.memoryStore.saveItem(item);
  }

  async getLowStock(): Promise<Inventory[]> {
    const all = await this.memoryStore.findAll();
    return all.filter(p => p.quantity <= p.lowStockThreshold);
  }
}
