'use client';

import { Center, Box } from '@mantine/core';
import { LoginForm } from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <Center style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Box>
        <LoginForm />
      </Box>
    </Center>
  );
}
