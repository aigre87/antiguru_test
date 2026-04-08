'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Box, Loader } from '@mantine/core';
import { LoginForm } from '@/components/LoginForm';
import { useAuthStore, useIsAuthenticated } from '@/stores/authStore';

export default function LoginPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s._hydrated);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace('/products');
    }
  }, [hydrated, isAuthenticated, router]);

  // Wait for Zustand to rehydrate from localStorage before rendering
  if (!hydrated) {
    return (
      <Center style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  // If already authenticated, don't flash the login form
  if (isAuthenticated) {
    return null;
  }

  return (
    <Center style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Box>
        <LoginForm />
      </Box>
    </Center>
  );
}
