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
    @Optional() @InjectRepository(Inventory)
    private readonly repository: Repository<Inventory>,
    private readonly memoryStore: InventoryMemoryStore,
  ) {}

  private get isUsingRepo() {
    return !!process.env.DB_TYPE || !!process.env.POSTGRES_URL;
  }

  private determineStatus(qty: number, threshold: number): InventoryStatus {
    if (qty === 0) return InventoryStatus.OUT_OF_STOCK;
    if (qty <= threshold) return InventoryStatus.LOW_STOCK;
    return InventoryStatus.IN_STOCK;
  }

  async create(createDto: CreateInventoryDto): Promise<Inventory> {
    const existing = this.isUsingRepo 
      ? await this.repository.findOneBy({ sku: createDto.sku })
      : await this.memoryStore.findOneBySku(createDto.sku);

    if (existing) {
      throw new ConflictException(`Inventory item with SKU ${createDto.sku} already exists.`);
    }

    const item = new Inventory();
    Object.assign(item, createDto);
    item.status = this.determineStatus(item.quantity, item.lowStockThreshold || 10);
    
    return this.isUsingRepo ? await this.repository.save(item) : this.memoryStore.saveItem(item);
  }

  async findAll(): Promise<Inventory[]> {
    return this.isUsingRepo ? await this.repository.find() : this.memoryStore.findAll();
  }

  async findOne(id: string): Promise<Inventory> {
    const item = this.isUsingRepo 
      ? await this.repository.findOneBy({ id } as any)
      : await this.memoryStore.findOne(id);

    if (!item) {
      throw new NotFoundException(`Inventory item with ID ${id} not found.`);
    }
    return item;
  }

  async update(id: string, updateDto: UpdateInventoryDto): Promise<Inventory> {
    const item = await this.findOne(id);
    
    if (updateDto.sku && updateDto.sku !== item.sku) {
      const existingSku = this.isUsingRepo 
        ? await this.repository.findOneBy({ sku: updateDto.sku })
        : await this.memoryStore.findOneBySku(updateDto.sku);
      if (existingSku) {
        throw new ConflictException(`Inventory item with SKU ${updateDto.sku} already exists.`);
      }
    }

    Object.assign(item, updateDto);
    item.status = this.determineStatus(item.quantity, item.lowStockThreshold);
    return this.isUsingRepo ? await this.repository.save(item) : this.memoryStore.saveItem(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    if (this.isUsingRepo) {
      await this.repository.remove(item);
    } else {
      await this.memoryStore.remove(id);
    }
  }

  async updateQuantity(id: string, quantity: number): Promise<Inventory> {
    if (quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative.');
    }

    const item = await this.findOne(id);
    item.quantity = quantity;
    item.status = this.determineStatus(item.quantity, item.lowStockThreshold);
    return this.isUsingRepo ? await this.repository.save(item) : this.memoryStore.saveItem(item);
  }

  async getLowStock(): Promise<Inventory[]> {
    if (this.isUsingRepo) {
      // In a real app, you'd use a query builder to filter in DB
      const all = await this.repository.find();
      return all.filter(p => p.quantity <= p.lowStockThreshold);
    }
    const all = await this.memoryStore.findAll();
    return all.filter(p => p.quantity <= p.lowStockThreshold);
  }
}
