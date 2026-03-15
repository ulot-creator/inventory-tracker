import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/http-exception.filter';

/**
 * Inventory E2E Tests
 *
 * Requires a running PostgreSQL database configured via environment variables.
 * These tests run against the real DB — each run creates and removes real data.
 *
 * Base URL prefix: /v1
 */
describe('Inventory API (e2e)', () => {
  let app: INestApplication<App>;
  let createdItemId: string;

  const validItem = {
    sku: `E2E-SKU-${Date.now()}`, // unique per run
    name: 'E2E Test Widget',
    category: 'Electronics',
    unit: 'pcs',
    quantity: 20,
    lowStockThreshold: 10,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── POST /v1/inventory ────────────────────────────────────────────────────

  describe('POST /v1/inventory', () => {
    it('TC-01 — should create a valid item and return 201 with IN_STOCK status', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send(validItem)
        .expect(201);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(1000); // Performance: < 1s

      expect(res.body).toMatchObject({
        sku: validItem.sku,
        name: validItem.name,
        quantity: 20,
        status: 'IN_STOCK',
      });
      expect(res.body.id).toBeDefined();
      createdItemId = res.body.id;
    });

    it('TC-02 — should return 409 Conflict when SKU already exists', async () => {
      await request(app.getHttpServer())
        .post('/v1/inventory')
        .send(validItem) // same SKU
        .expect(409);
    });

    it('TC-03 — should return 400 Bad Request when required fields are missing', async () => {
      await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ category: 'Electronics' }) // missing sku, name, quantity
        .expect(400);
    });

    it('TC-04 — should return 400 Bad Request when quantity is negative', async () => {
      await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `NEGATIVE-${Date.now()}`, name: 'Bad Item', quantity: -1 })
        .expect(400);
    });

    it('TC-05 — should set status to LOW_STOCK when qty <= threshold', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({
          sku: `E2E-LOW-${Date.now()}`,
          name: 'Low Stock Widget',
          quantity: 3,
          lowStockThreshold: 10,
        })
        .expect(201);
      expect(res.body.status).toBe('LOW_STOCK');
    });

    it('TC-06 — should set status to OUT_OF_STOCK when qty === 0', async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({
          sku: `E2E-OOS-${Date.now()}`,
          name: 'Empty Widget',
          quantity: 0,
          lowStockThreshold: 10,
        })
        .expect(201);
      expect(res.body.status).toBe('OUT_OF_STOCK');
    });
  });

  // ─── GET /v1/inventory ─────────────────────────────────────────────────────

  describe('GET /v1/inventory', () => {
    it('TC-07 — should return an array of items within 1 second', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .get('/v1/inventory')
        .expect(200);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('TC-08 — should not include soft-deleted items', async () => {
      // Delete one item and confirm it disappears from the list
      await request(app.getHttpServer()).delete(`/v1/inventory/${createdItemId}`);
      const res = await request(app.getHttpServer()).get('/v1/inventory').expect(200);
      const ids = res.body.map((i: { id: string }) => i.id);
      expect(ids).not.toContain(createdItemId);
    });
  });

  // ─── GET /v1/inventory/:id ─────────────────────────────────────────────────

  describe('GET /v1/inventory/:id', () => {
    let activeItemId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `E2E-GET-${Date.now()}`, name: 'Get Test', quantity: 50, lowStockThreshold: 5 });
      activeItemId = res.body.id;
    });

    it('TC-09 — should return the correct item by ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/v1/inventory/${activeItemId}`)
        .expect(200);
      expect(res.body.id).toBe(activeItemId);
    });

    it('TC-10 — should return 404 for a non-existent ID', async () => {
      await request(app.getHttpServer())
        .get('/v1/inventory/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ─── GET /v1/inventory/low-stock ───────────────────────────────────────────

  describe('GET /v1/inventory/low-stock', () => {
    let lowId: string;
    let highId: string;

    beforeAll(async () => {
      const ts = Date.now();
      const low = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `E2E-LSLOW-${ts}`, name: 'Low', quantity: 2, lowStockThreshold: 10 });
      lowId = low.body.id;

      const high = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `E2E-LSHIGH-${ts}`, name: 'High', quantity: 50, lowStockThreshold: 10 });
      highId = high.body.id;
    });

    it('TC-11 — should include items where quantity <= lowStockThreshold', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .get('/v1/inventory/low-stock')
        .expect(200);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Performance check
      expect(Array.isArray(res.body)).toBe(true);
      const ids = res.body.map((i: { id: string }) => i.id);
      expect(ids).toContain(lowId);
    });

    it('TC-12 — should NOT include items above threshold', async () => {
      const res = await request(app.getHttpServer()).get('/v1/inventory/low-stock').expect(200);
      const ids = res.body.map((i: { id: string }) => i.id);
      expect(ids).not.toContain(highId);
    });

    // TC-13: Low stock detection accuracy — all items with qty <= threshold must appear
    it('TC-13 — low stock detection accuracy: no false negatives', async () => {
      const allRes = await request(app.getHttpServer()).get('/v1/inventory').expect(200);
      const lowRes = await request(app.getHttpServer()).get('/v1/inventory/low-stock').expect(200);

      const trueLowStock = allRes.body.filter(
        (i: { quantity: number; lowStockThreshold: number }) =>
          i.quantity <= i.lowStockThreshold,
      );
      const lowStockIds = new Set(lowRes.body.map((i: { id: string }) => i.id));

      for (const item of trueLowStock) {
        expect(lowStockIds.has(item.id)).toBe(true);
      }
    });
  });

  // ─── PATCH /v1/inventory/:id/quantity ──────────────────────────────────────

  describe('PATCH /v1/inventory/:id/quantity', () => {
    let patchItemId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `E2E-PATCH-${Date.now()}`, name: 'Patch Test', quantity: 20, lowStockThreshold: 5 });
      patchItemId = res.body.id;
    });

    it('TC-14 — should update quantity and recalculate status to LOW_STOCK', async () => {
      const start = Date.now();
      const res = await request(app.getHttpServer())
        .patch(`/v1/inventory/${patchItemId}/quantity`)
        .send({ quantity: 5 })
        .expect(200);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(1000); // Performance: < 1s
      expect(res.body.quantity).toBe(5);
      expect(res.body.status).toBe('LOW_STOCK');
    });

    it('TC-15 — should return 400 when quantity is negative', async () => {
      await request(app.getHttpServer())
        .patch(`/v1/inventory/${patchItemId}/quantity`)
        .send({ quantity: -10 })
        .expect(400);
    });

    it('TC-16 — should set status to OUT_OF_STOCK when quantity is 0', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/inventory/${patchItemId}/quantity`)
        .send({ quantity: 0 })
        .expect(200);
      expect(res.body.status).toBe('OUT_OF_STOCK');
    });

    it('TC-17 — should set status to IN_STOCK when quantity exceeds threshold', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/inventory/${patchItemId}/quantity`)
        .send({ quantity: 100 })
        .expect(200);
      expect(res.body.status).toBe('IN_STOCK');
    });

    it('TC-18 — should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .patch('/v1/inventory/00000000-0000-0000-0000-000000000000/quantity')
        .send({ quantity: 5 })
        .expect(404);
    });
  });

  // ─── DELETE /v1/inventory/:id ──────────────────────────────────────────────

  describe('DELETE /v1/inventory/:id', () => {
    let deleteItemId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `E2E-DEL-${Date.now()}`, name: 'Delete Test', quantity: 10, lowStockThreshold: 5 });
      deleteItemId = res.body.id;
    });

    it('TC-19 — should soft-delete an item (returns 200)', async () => {
      await request(app.getHttpServer())
        .delete(`/v1/inventory/${deleteItemId}`)
        .expect(200);
    });

    it('TC-20 — deleted item should not appear in GET /v1/inventory', async () => {
      const res = await request(app.getHttpServer()).get('/v1/inventory').expect(200);
      const ids = res.body.map((i: { id: string }) => i.id);
      expect(ids).not.toContain(deleteItemId);
    });

    it('TC-21 — should return 404 for already-deleted item', async () => {
      await request(app.getHttpServer())
        .get(`/v1/inventory/${deleteItemId}`)
        .expect(404);
    });

    it('TC-22 — should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .delete('/v1/inventory/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ─── PATCH /v1/inventory/:id (full update) ─────────────────────────────────

  describe('PATCH /v1/inventory/:id', () => {
    let updateItemId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/v1/inventory')
        .send({ sku: `E2E-UPD-${Date.now()}`, name: 'Update Test', quantity: 30, lowStockThreshold: 5 });
      updateItemId = res.body.id;
    });

    it('TC-23 — should update item name successfully', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/v1/inventory/${updateItemId}`)
        .send({ name: 'Updated Widget Name' })
        .expect(200);
      expect(res.body.name).toBe('Updated Widget Name');
    });

    it('TC-24 — should return 404 for non-existent item', async () => {
      await request(app.getHttpServer())
        .patch('/v1/inventory/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Should fail' })
        .expect(404);
    });
  });
});
