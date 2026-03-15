import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface InventoryItem {
  id?: string;
  sku: string;
  name: string;
  category?: string;
  unit?: string;
  quantity: number;
  lowStockThreshold?: number;
}

export const inventoryService = {
  getAll: async () => {
    const response = await api.get<InventoryItem[]>('/inventory');
    return response.data;
  },
  
  getLowStock: async () => {
    const response = await api.get<InventoryItem[]>('/inventory/low-stock');
    return response.data;
  },
  
  create: async (item: InventoryItem) => {
    const response = await api.post<InventoryItem>('/inventory', item);
    return response.data;
  },
  
  updateQuantity: async (id: string, quantity: number) => {
    const response = await api.patch<InventoryItem>(`/inventory/${id}/quantity`, { quantity });
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/inventory/${id}`);
  }
};
