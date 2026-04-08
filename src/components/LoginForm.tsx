'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Paper,
  Title,
  Text,
  Anchor,
  Stack,
  Alert,
  Box,
  Center,
  Divider,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import {
  IconAlertCircle,
  IconUser,
  IconLock,
  IconMail,
} from '@tabler/icons-react';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { authApi, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import {Logo} from "@/components/Logo";

interface LoginFormValues extends LoginFormData {
  rememberMe: boolean;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginFormValues>({
    validate: schemaResolver(loginSchema),
    initialValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const authResponse = await authApi.login({
        username: values.username,
        password: values.password,
      });

      setAuth(authResponse, values.rememberMe);
      router.push('/products');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Неверные учётные данные');
      } else {
        setError('Произошла непредвиденная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="lg" p={40} radius="lg" style={{ width: 420 }}>
      {/* Logo icon */}
      <Center mb="md">
        <Logo />
      </Center>

      <Title order={2} ta="center" fw={700} mb={4}>
        Добро пожаловать!
      </Title>
      <Text ta="center" c="dimmed" size="sm" mb="xl">
        Пожалуйста, авторизуйтесь
      </Text>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка"
          color="red"
          mb="md"
          withCloseButton
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Логин"
            placeholder="Введите логин"
            leftSection={<IconUser size={16} stroke={1.5} />}
            required
            {...form.getInputProps('username')}
          />

          <PasswordInput
            label="Пароль"
            placeholder="Введите пароль"
            leftSection={<IconLock size={16} stroke={1.5} />}
            required
            {...form.getInputProps('password')}
          />

          <Checkbox
            label="Запомнить данные"
            {...form.getInputProps('rememberMe', { type: 'checkbox' })}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            size="md"
            radius="xl"
          >
            Войти
          </Button>
        </Stack>
      </form>

      <Divider label="или" labelPosition="center" my="md" />

      <Text ta="center" size="sm">
        Нет аккаунта?{' '}
        <Anchor
          href="#"
          fw={600}
          onClick={(e) => e.preventDefault()}
        >
          Создать
        </Anchor>
      </Text>
    </Paper>
  );
}
