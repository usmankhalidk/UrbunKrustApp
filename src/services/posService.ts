import { apiClient } from './apiClient';

export interface PosCategory {
  id: string;
  name: string;
  restaurantId: string;
}

export interface PosVariant {
  id: string;
  name: string;
  priceModifier: string;
  isDefault: boolean;
  menuItemId: string;
}

export interface PosMenuItem {
  id: string;
  name: string;
  price: string;
  image: string;
  itemCode: string;
  categoryId: string;
  variants: PosVariant[];
}

export interface PosDeal {
  id: string;
  name: string;
  price: string;
  image: string;
  items: any[];
}

export interface PosTable {
  id: string;
  tableNumber: string;
  capacity: number;
}

export interface PosCounter {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  menuItem: { name: string };
  variant: { name: string } | null;
  deal: { name: string } | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface PosOrder {
  id: string;
  orderNumber: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
  status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED' | 'CONFIRMED';
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  notes: string | null;
  subtotal: string;
  total: string;
  discount: string;
  counterId: string;
  table: { tableNumber: string } | null;
  items: OrderItem[];
  createdAt: string;
  createdBy: { fullName: string };
  invoice: { invoiceNumber: string } | null;
}

export interface PosProfile {
  id: string;
  name: string;
  abbriviation: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logo: string;
  isActive: boolean;
  plan: string;
  subscriptionStatus: string;
  userCount: number;
  _count: {
    users: number;
    tables: number;
    menuCategories: number;
    orders: number;
  };
}

export const posService = {
  getCategories: async (): Promise<{ success: boolean; data: PosCategory[]; message: string }> => {
    const response = await apiClient.get('/menu/categories');
    return response.data;
  },

  getMenuItems: async (): Promise<{ success: boolean; data: PosMenuItem[]; count: number }> => {
    const response = await apiClient.get('/menu/items');
    return response.data;
  },

  getDeals: async (): Promise<{ success: boolean; data: PosDeal[]; message: string }> => {
    const response = await apiClient.get('/deal');
    return response.data;
  },

  getTables: async (): Promise<{ success: boolean; data: PosTable[]; message: string }> => {
    const response = await apiClient.get('/table');
    return response.data;
  },

  getCounters: async (): Promise<{ success: boolean; data: PosCounter[]; message: string }> => {
    const response = await apiClient.get('/counter');
    return response.data;
  },

  createOrder: async (payload: any): Promise<any> => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  getOrders: async (params: {
    page: number;
    limit: number;
    fromDate?: string;
    toDate?: string;
    counterId?: string;
    status?: string;
    orderType?: string;
  }): Promise<{
    success: boolean;
    data: {
      orders: PosOrder[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    };
    message: string;
  }> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  getProfile: async (): Promise<{ success: boolean; data: PosProfile; message: string }> => {
    const response = await apiClient.get('/restaurant/profile');
    return response.data;
  },
};
