import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory, InventoryStatus } from './entities/inventory.entity';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

// Helper to build a minimal inventory item
const makeItem = (overrides: Partial<Inventory> = {}): Inventory => ({
  id: 'uuid-1',
  sku: 'SKU-001',
  name: 'Test Item',
  category: 'Electronics',
  unit: 'pcs',
  quantity: 10,
  lowStockThreshold: 5,
  status: InventoryStatus.IN_STOCK,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('InventoryService', () => {
  let service: InventoryService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should throw ConflictException if SKU already exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(makeItem());
      await expect(
        service.create({ sku: 'SKU-001', name: 'Test', quantity: 10 }),
      ).rejects.toThrow(ConflictException);
    });

    it('should set status to IN_STOCK when qty > threshold', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      const dto = { sku: 'SKU-002', name: 'Item', quantity: 15, lowStockThreshold: 10 };
      mockRepository.create.mockReturnValue({ ...dto });
      mockRepository.save.mockImplementation((item) =>
        Promise.resolve({ ...item, id: 'new-uuid' }),
      );
      const result = await service.create(dto);
      expect(result.status).toBe(InventoryStatus.IN_STOCK);
    });

    it('should set status to LOW_STOCK when qty <= threshold', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      const dto = { sku: 'SKU-003', name: 'Item', quantity: 5, lowStockThreshold: 10 };
      mockRepository.create.mockReturnValue({ ...dto });
      mockRepository.save.mockImplementation((item) =>
        Promise.resolve({ ...item, id: 'new-uuid' }),
      );
      const result = await service.create(dto);
      expect(result.status).toBe(InventoryStatus.LOW_STOCK);
    });

    it('should set status to OUT_OF_STOCK when qty === 0', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      const dto = { sku: 'SKU-004', name: 'Item', quantity: 0, lowStockThreshold: 10 };
      mockRepository.create.mockReturnValue({ ...dto });
      mockRepository.save.mockImplementation((item) =>
        Promise.resolve({ ...item, id: 'new-uuid' }),
      );
      const result = await service.create(dto);
      expect(result.status).toBe(InventoryStatus.OUT_OF_STOCK);
    });

    it('should use default lowStockThreshold of 10 when not provided', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      const dto = { sku: 'SKU-005', name: 'Item', quantity: 8 };
      mockRepository.create.mockReturnValue({ ...dto, lowStockThreshold: undefined });
      mockRepository.save.mockImplementation((item) =>
        Promise.resolve({ ...item, id: 'new-uuid' }),
      );
      // qty 8 < default threshold 10 → LOW_STOCK
      const result = await service.create(dto);
      expect(result.status).toBe(InventoryStatus.LOW_STOCK);
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return only non-deleted items', async () => {
      const items = [makeItem(), makeItem({ id: 'uuid-2', sku: 'SKU-006' })];
      mockRepository.find.mockResolvedValueOnce(items);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(mockRepository.find).toHaveBeenCalledWith({ where: { isDeleted: false } });
    });
  });

  // ─── findOne ───────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return the item when found', async () => {
      const item = makeItem();
      mockRepository.findOne.mockResolvedValueOnce(item);
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(item);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update item fields and recalculate status', async () => {
      const existingItem = makeItem({ quantity: 20, lowStockThreshold: 5 });
      mockRepository.findOne.mockResolvedValueOnce(existingItem);
      mockRepository.save.mockImplementation((item) => Promise.resolve(item));
      const result = await service.update('uuid-1', { quantity: 3 });
      expect(result.status).toBe(InventoryStatus.LOW_STOCK);
    });

    it('should throw ConflictException when updating to an existing SKU', async () => {
      const existingItem = makeItem({ sku: 'SKU-001' });
      mockRepository.findOne
        .mockResolvedValueOnce(existingItem)       // findOne for the target item
        .mockResolvedValueOnce(makeItem({ id: 'other-uuid', sku: 'SKU-999' })); // existing SKU conflict
      await expect(
        service.update('uuid-1', { sku: 'SKU-999' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating SKU to the same value without conflict', async () => {
      const existingItem = makeItem({ sku: 'SKU-001' });
      mockRepository.findOne.mockResolvedValueOnce(existingItem);
      mockRepository.save.mockImplementation((item) => Promise.resolve(item));
      const result = await service.update('uuid-1', { sku: 'SKU-001', quantity: 20 });
      expect(result.sku).toBe('SKU-001');
    });
  });

  // ─── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete by setting isDeleted to true', async () => {
      const item = makeItem({ isDeleted: false });
      mockRepository.findOne.mockResolvedValueOnce(item);
      mockRepository.save.mockImplementation((i) => Promise.resolve(i));
      await service.remove('uuid-1');
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isDeleted: true }),
      );
    });

    it('should throw NotFoundException if item does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.remove('ghost-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── updateQuantity ────────────────────────────────────────────────────────

  describe('updateQuantity', () => {
    it('should throw BadRequestException when quantity is negative', async () => {
      await expect(service.updateQuantity('uuid-1', -5)).rejects.toThrow(BadRequestException);
    });

    it('should set status to OUT_OF_STOCK when quantity is 0', async () => {
      mockRepository.findOne.mockResolvedValueOnce(makeItem({ quantity: 10, lowStockThreshold: 5 }));
      mockRepository.save.mockImplementation((item) => Promise.resolve(item));
      const result = await service.updateQuantity('uuid-1', 0);
      expect(result.status).toBe(InventoryStatus.OUT_OF_STOCK);
    });

    it('should set status to LOW_STOCK when quantity <= threshold', async () => {
      mockRepository.findOne.mockResolvedValueOnce(makeItem({ quantity: 10, lowStockThreshold: 5 }));
      mockRepository.save.mockImplementation((item) => Promise.resolve(item));
      const result = await service.updateQuantity('uuid-1', 5);
      expect(result.status).toBe(InventoryStatus.LOW_STOCK);
    });

    it('should set status to IN_STOCK when quantity > threshold', async () => {
      mockRepository.findOne.mockResolvedValueOnce(makeItem({ quantity: 3, lowStockThreshold: 5 }));
      mockRepository.save.mockImplementation((item) => Promise.resolve(item));
      const result = await service.updateQuantity('uuid-1', 20);
      expect(result.status).toBe(InventoryStatus.IN_STOCK);
    });

    it('should throw NotFoundException if item does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);
      await expect(service.updateQuantity('ghost-id', 10)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getLowStock ───────────────────────────────────────────────────────────

  describe('getLowStock', () => {
    it('should call query builder with correct conditions', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([makeItem({ quantity: 3, lowStockThreshold: 5 })]);
      const result = await service.getLowStock();
      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('product');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'product.isDeleted = :isDeleted',
        { isDeleted: false },
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no items are low stock', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);
      const result = await service.getLowStock();
      expect(result).toEqual([]);
    });
  });
});
