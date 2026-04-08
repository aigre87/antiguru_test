'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProductsState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  search: string;
  setSortBy: (field: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  toggleSort: (field: string) => void;
  setPage: (page: number) => void;
  setSearch: (search: string) => void;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      sortBy: 'title',
      sortOrder: 'asc',
      page: 1,
      search: '',
      setSortBy: (field) => set({ sortBy: field, page: 1 }),
      setSortOrder: (order) => set({ sortOrder: order }),
      toggleSort: (field) => {
        const state = get();
        if (state.sortBy === field) {
          set({ sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc' });
        } else {
          set({ sortBy: field, sortOrder: 'asc' });
        }
      },
      setPage: (page) => set({ page }),
      setSearch: (search) => set({ search, page: 1 }),
    }),
    {
      name: 'products-sort-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
