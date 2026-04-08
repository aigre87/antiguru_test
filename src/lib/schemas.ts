import { z } from 'zod';

// ─── Login ───────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  username: z.string().min(1, 'Логин обязателен'),
  password: z.string().min(1, 'Пароль обязателен'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Add Product Form ────────────────────────────────────────────────────────

export const productSchema = z.object({
  title: z.string().min(1, 'Наименование обязательно'),
  price: z.number().min(0, 'Цена должна быть положительной'),
  vendor: z.string().min(1, 'Вендор обязателен'),
  article: z.string().min(1, 'Артикул обязателен'),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── API Response Schemas ────────────────────────────────────────────────────

export const productResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number(),
  discountPercentage: z.number().optional(),
  rating: z.number(),
  stock: z.number(),
  brand: z.string().nullable().optional(),
  category: z.string(),
  thumbnail: z.string(),
  images: z.array(z.string()).optional(),
  sku: z.string().optional(),
});

export const productsListResponseSchema = z.object({
  products: z.array(productResponseSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});

export const authResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  gender: z.string(),
  image: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type Product = z.infer<typeof productResponseSchema>;
export type ProductsListResponse = z.infer<typeof productsListResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
