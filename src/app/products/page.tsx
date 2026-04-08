'use client';

import { useEffect } from 'react';
import { Container, Group, Button, Text, Box } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ProductList } from '@/components/ProductList';
import { useAuthStore, useIsAuthenticated, useCurrentUser } from '@/stores/authStore';

export default function ProductsPage() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
