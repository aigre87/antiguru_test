import { z } from 'zod';
import {
  authResponseSchema,
  productsListResponseSchema,
  type LoginFormData,
  type AuthResponse,
  type ProductsListResponse,
} from './schemas';

const BASE_URL = 'https://dummyjson.com';

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(errorData.message || `HTTP error ${response.status}`, response.status);
  }
  const data = await response.json();
  return schema.parse(data);
}

export const authApi = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response, authResponseSchema);
  },
};

export interface GetProductsParams {
  skip?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export const productsApi = {
  async getProducts(params: GetProductsParams = {}): Promise<ProductsListResponse> {
    const { skip = 0, limit = 20, search, sortBy, order } = params;

    let url: string;
    if (search && search.trim().length > 0) {
      url = `${BASE_URL}/products/search?q=${encodeURIComponent(search.trim())}&limit=${limit}&skip=${skip}`;
    } else {
      url = `${BASE_URL}/products?limit=${limit}&skip=${skip}`;
    }

    if (sortBy) {
      url += `&sortBy=${sortBy}&order=${order || 'asc'}`;
    }

    const response = await fetch(url);
    return handleResponse(response, productsListResponseSchema);
  },
};
