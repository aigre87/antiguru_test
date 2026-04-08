'use client';

import { useEffect } from 'react';
import { Container, Box, Center, Loader } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/ProductList';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';

export default function ProductsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const hydrated = useAuthStore((s) => s._hydrated);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // Only redirect after hydration is complete
    if (hydrated && !isAuthenticated) {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, router]);

  // Show loader while Zustand rehydrates from localStorage
  if (!hydrated) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      <Container size="xl" py="lg">
        <ProductList />
      </Container>
    </Box>
  );
}
