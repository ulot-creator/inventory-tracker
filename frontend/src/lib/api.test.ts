import MockAdapter from 'axios-mock-adapter';
import { inventoryService, InventoryItem, api } from './api';

// Create a mock adapter on the exported 'api' instance.
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

describe('inventoryService (api.ts)', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    // Create mock on the exported axios instance
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  const mockItem: InventoryItem = {
    id: 'abc-123',
    sku: 'SKU-001',
    name: 'Widget',
    category: 'Electronics',
    unit: 'pcs',
    quantity: 20,
    lowStockThreshold: 10,
  };

  const lowStockItem: InventoryItem = {
    id: 'abc-456',
    sku: 'SKU-002',
    name: 'Low Widget',
    quantity: 3,
    lowStockThreshold: 10,
  };

  // ─── getAll ──────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('should fetch all inventory items', async () => {
      mock.onGet(`${BASE}/inventory`).reply(200, [mockItem]);
      const result = await inventoryService.getAll();
      expect(result).toEqual([mockItem]);
    });

    it('should return an empty array when there are no items', async () => {
      mock.onGet(`${BASE}/inventory`).reply(200, []);
      const result = await inventoryService.getAll();
      expect(result).toEqual([]);
    });

    it('should throw when the server returns an error', async () => {
      mock.onGet(`${BASE}/inventory`).reply(500);
      await expect(inventoryService.getAll()).rejects.toThrow();
    });
  });

  // ─── getLowStock ─────────────────────────────────────────────────────────

  describe('getLowStock', () => {
    it('should fetch low-stock items', async () => {
      mock.onGet(`${BASE}/inventory/low-stock`).reply(200, [lowStockItem]);
      const result = await inventoryService.getLowStock();
      expect(result).toEqual([lowStockItem]);
      expect(result[0].quantity).toBeLessThanOrEqual(result[0].lowStockThreshold!);
    });

    it('should return empty array when no items are low stock', async () => {
      mock.onGet(`${BASE}/inventory/low-stock`).reply(200, []);
      const result = await inventoryService.getLowStock();
      expect(result).toHaveLength(0);
    });
  });

  // ─── create ──────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should POST the item payload and return the created item', async () => {
      const payload: InventoryItem = { sku: 'NEW-001', name: 'New Widget', quantity: 50 };
      const responseBody: InventoryItem = { ...payload, id: 'new-uuid' };
      mock.onPost(`${BASE}/inventory`).reply(201, responseBody);

      const result = await inventoryService.create(payload);
      expect(result).toEqual(responseBody);
      expect(result.id).toBeDefined();
    });

    it('should throw when server returns 409 (duplicate SKU)', async () => {
      mock.onPost(`${BASE}/inventory`).reply(409, { message: 'SKU already exists' });
      await expect(
        inventoryService.create({ sku: 'DUP', name: 'Dup', quantity: 10 }),
      ).rejects.toThrow();
    });

    it('should throw when server returns 400 (validation error)', async () => {
      mock.onPost(`${BASE}/inventory`).reply(400, { message: 'Validation failed' });
      await expect(
        inventoryService.create({ sku: '', name: '', quantity: -1 }),
      ).rejects.toThrow();
    });
  });

  // ─── updateQuantity ──────────────────────────────────────────────────────

  describe('updateQuantity', () => {
    it('should PATCH the correct endpoint with the quantity payload', async () => {
      const updated = { ...mockItem, quantity: 5 };
      mock.onPatch(`${BASE}/inventory/abc-123/quantity`).reply(200, updated);

      const result = await inventoryService.updateQuantity('abc-123', 5);
      expect(result.quantity).toBe(5);
    });

    it('should throw when server returns 400 (negative quantity)', async () => {
      mock.onPatch(`${BASE}/inventory/abc-123/quantity`).reply(400);
      await expect(
        inventoryService.updateQuantity('abc-123', -1),
      ).rejects.toThrow();
    });

    it('should throw when server returns 404 (item not found)', async () => {
      mock.onPatch(`${BASE}/inventory/ghost-id/quantity`).reply(404);
      await expect(
        inventoryService.updateQuantity('ghost-id', 10),
      ).rejects.toThrow();
    });
  });

  // ─── delete ──────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should DELETE the correct endpoint', async () => {
      mock.onDelete(`${BASE}/inventory/abc-123`).reply(200);
      await expect(inventoryService.delete('abc-123')).resolves.toBeUndefined();
    });

    it('should throw when server returns 404', async () => {
      mock.onDelete(`${BASE}/inventory/ghost-id`).reply(404);
      await expect(inventoryService.delete('ghost-id')).rejects.toThrow();
    });
  });
});
