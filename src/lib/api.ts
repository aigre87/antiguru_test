import { z } from 'zod';
import { ApiError } from './errors';
import {
  authResponseSchema,
  productsListResponseSchema,
  type LoginFormData,
  type AuthResponse,
  type ProductsListResponse,
} from './schemas';

const BASE_URL = 'https://dummyjson.com';

// ─── Response handler with safeParse + typed errors ──────────────────────────

async function handleResponse<T>(response: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError({
      kind: 'http',
      status: response.status,
      message: errorData.message || `HTTP error ${response.status}`,
    });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiError({
      kind: 'unknown',
      message: 'Failed to parse response JSON',
    });
  }

  const result = schema.safeParse(data);

  if (!result.success) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[API] Validation failed:', result.error.issues);
    }
    throw new ApiError({
      kind: 'validation',
      message: 'Invalid API response',
      issues: result.error.issues,
    });
  }

  return result.data;
}

// ─── Fetch wrapper with network error handling ───────────────────────────────

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    throw new ApiError({
      kind: 'network',
      message: error instanceof Error ? error.message : 'Network request failed',
    });
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await safeFetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response, authResponseSchema);
  },
};

// ─── Products API ────────────────────────────────────────────────────────────

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

    const response = await safeFetch(url);
    return handleResponse(response, productsListResponseSchema);
  },
};
