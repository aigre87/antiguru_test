'use client';

import { useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Stack,
  Group,
} from '@mantine/core';
import { useForm, schemaResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { productSchema, type ProductFormData } from '@/lib/schemas';

interface AddProductModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AddProductModal({ opened, onClose }: AddProductModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFormData>({
    validate: schemaResolver(productSchema),
    initialValues: {
      title: '',
      price: 0,
      vendor: '',
      article: '',
    },
  });

  const handleSubmit = async (values: ProductFormData) => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Note: We don't actually save via API per requirements
    // Just show success notification

    notifications.show({
      title: 'Товар добавлен',
      message: `Товар "${values.title}" успешно добавлен`,
      color: 'green',
    });

    form.reset();
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Добавить товар"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Наименование"
            placeholder="Введите наименование товара"
            required
            {...form.getInputProps('title')}
          />

          <NumberInput
            label="Цена"
            placeholder="Введите цену"
            required
            min={0}
            decimalScale={2}
            {...form.getInputProps('price')}
          />

          <TextInput
            label="Вендор"
            placeholder="Введите название вендора"
            required
            {...form.getInputProps('vendor')}
          />

          <TextInput
            label="Артикул"
            placeholder="Введите артикул товара"
            required
            {...form.getInputProps('article')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" loading={loading}>
              Добавить
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
