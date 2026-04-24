import { getAccessToken, logout } from './auth';

const API_URL = 'http://localhost:8080/api/v1';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('غير مصرح');
  }

  if (!response.ok) {
    throw new Error(`خطأ: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export interface Product {
  id?: number;
  barcode: string;
  scientificName: string;
  tradeName: string;
  category: string;
  manufacturer: string;
  costPrice: number;
  sellingPrice?: number;
  currentStock: number;
  reorderLevel: number;
  expiryDate: string;
  prescriptionRequired: boolean;
  isActive: boolean;
}

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    return fetchWithAuth('/products');
  },

  getById: async (id: number): Promise<Product> => {
    return fetchWithAuth(`/products/${id}`);
  },

  create: async (product: Product): Promise<Product> => {
    return fetchWithAuth('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: number, product: Product): Promise<Product> => {
    return fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: number): Promise<void> => {
    await fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
  },

  search: async (keyword: string): Promise<Product[]> => {
    return fetchWithAuth(`/products/search?keyword=${keyword}`);
  },
};

export const saleApi = {
  create: async (sale: any): Promise<any> => {
    return fetchWithAuth('/sales', {
      method: 'POST',
      body: JSON.stringify(sale),
    });
  },

  getAll: async (): Promise<any[]> => {
    return fetchWithAuth('/sales');
  },
};
