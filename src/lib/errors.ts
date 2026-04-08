import type { z } from 'zod';

// ─── Discriminated union for API errors ──────────────────────────────────────

export type ApiErrorKind =
  | { kind: 'network'; message: string }
  | { kind: 'http'; status: number; message: string }
  | { kind: 'validation'; message: string; issues: z.ZodIssue[] }
  | { kind: 'unknown'; message: string };

/**
 * Typed API error with discriminated `kind` field.
 * Use `error.kind` to narrow the type instead of `instanceof`.
 */
export class ApiError extends Error {
  public readonly kind: ApiErrorKind['kind'];
  public readonly status?: number;
  public readonly issues?: z.ZodIssue[];

  constructor(errorKind: ApiErrorKind) {
    super(errorKind.message);
    this.name = 'ApiError';
    this.kind = errorKind.kind;

    if (errorKind.kind === 'http') {
      this.status = errorKind.status;
    }

    if (errorKind.kind === 'validation') {
      this.issues = errorKind.issues;
    }
  }

  /**
   * Get the full error detail as a discriminated union object.
   */
  toErrorKind(): ApiErrorKind {
    switch (this.kind) {
      case 'network':
        return { kind: 'network', message: this.message };
      case 'http':
        return { kind: 'http', status: this.status!, message: this.message };
      case 'validation':
        return { kind: 'validation', message: this.message, issues: this.issues! };
      case 'unknown':
        return { kind: 'unknown', message: this.message };
    }
  }
}

// ─── Helper to extract user-friendly message ─────────────────────────────────

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'network':
        return 'Ошибка сети. Проверьте подключение к интернету.';
      case 'http':
        if (error.status === 401) return 'Неверные учётные данные';
        if (error.status === 403) return 'Доступ запрещён';
        if (error.status === 404) return 'Ресурс не найден';
        if (error.status && error.status >= 500) return 'Ошибка сервера. Попробуйте позже.';
        return error.message || `Ошибка HTTP ${error.status}`;
      case 'validation':
        return 'Сервер вернул некорректные данные';
      case 'unknown':
        return 'Произошла непредвиденная ошибка';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Произошла непредвиденная ошибка';
}

// ─── Helper to check if error is a specific kind ─────────────────────────────

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isHttpError(error: unknown, status?: number): boolean {
  if (!isApiError(error) || error.kind !== 'http') return false;
  return status === undefined || error.status === status;
}
