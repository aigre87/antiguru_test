'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import {
  Alert,
  Button,
  Group,
  Text,
  Box,
  TextInput,
  ActionIcon,
  Image,
  Stack,
  Pagination,
  Flex,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconRefresh,
  IconDotsCircleHorizontal,
  IconAlertCircle,
} from '@tabler/icons-react';
import { productsApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errors';
import { useProductsStore } from '@/stores/productsStore';
import { AddProductModal } from './AddProductModal';

const PAGE_SIZE = 20;

// Map DataTable accessor names to DummyJSON API sort fields
const SORT_FIELD_MAP: Record<string, string> = {
  title: 'title',
  brand: 'brand',
  price: 'price',
  rating: 'rating',
};

interface ProductRecord {
  id: number;
  title: string;
  price: number;
  rating: number;
  stock: number;
  brand: string | null;
  category: string;
  thumbnail: string;
  discountPercentage?: number;
  images?: string[];
  sku?: string;
}

export function ProductList() {
  const [modalOpened, setModalOpened] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    sortBy,
    sortOrder,
    page,
    search,
    toggleSort,
    setPage,
    setSearch,
  } = useProductsStore();

  // Sync search input with store on mount
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const sortStatus: DataTableSortStatus<ProductRecord> = {
    columnAccessor: sortBy as keyof ProductRecord,
    direction: sortOrder,
  };

  const skip = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['products', skip, PAGE_SIZE, search, sortBy, sortOrder],
    queryFn: () =>
      productsApi.getProducts({
        skip,
        limit: PAGE_SIZE,
        search: search || undefined,
        sortBy: SORT_FIELD_MAP[sortBy] || sortBy,
        order: sortOrder,
      }),
  });

  const records: ProductRecord[] = (data?.products as ProductRecord[]) || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSortStatusChange = useCallback(
    (status: DataTableSortStatus<ProductRecord>) => {
      toggleSort(status.columnAccessor as string);
    },
    [toggleSort]
  );

  const handleSearch = useCallback(() => {
    setSearch(searchInput);
  }, [searchInput, setSearch]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <Box>
      {/* Header with title and search */}
      <Group justify="space-between" mb="lg" align="center">
        <Text size="xl" fw={700}>
          Товары
        </Text>
        <TextInput
          placeholder="Найти"
          leftSection={<IconSearch size={16} />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.currentTarget.value)}
          onKeyDown={handleSearchKeyDown}
          style={{ flex: 1, maxWidth: 500 }}
        />
      </Group>

      {/* Subheader: "Все позиции" + refresh + add */}
      <Group justify="space-between" mb="md" align="center">
        <Text size="lg" fw={600}>
          Все позиции
        </Text>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            onClick={() => refetch()}
            title="Обновить таблицу"
          >
            <IconRefresh size={20} />
          </ActionIcon>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            Добавить
          </Button>
        </Group>
      </Group>

      {/* Error alert */}
      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Ошибка загрузки"
          color="red"
          mb="md"
          withCloseButton={false}
        >
          <Group justify="space-between" align="center">
            <Text size="sm">{getErrorMessage(error)}</Text>
            <Button
              variant="light"
              color="red"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={() => refetch()}
            >
              Повторить
            </Button>
          </Group>
        </Alert>
      )}

      {/* Data Table */}
      <DataTable
        records={records}
        fetching={isLoading || isFetching}
        minHeight={400}
        withTableBorder={false}
        highlightOnHover
        sortStatus={sortStatus}
        onSortStatusChange={handleSortStatusChange}
        columns={[
          {
            accessor: 'title',
            title: 'Наименование',
            sortable: true,
            render: (record) => (
              <Group gap="sm" wrap="nowrap">
                <Image
                  src={record.thumbnail}
                  alt={record.title}
                  w={40}
                  h={40}
                  radius="sm"
                  fallbackSrc="https://placehold.co/40x40?text=..."
                  style={{ flexShrink: 0 }}
                />
                <Stack gap={0}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {record.title}
                  </Text>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {record.category}
                  </Text>
                </Stack>
              </Group>
            ),
            width: 300,
          },
          {
            accessor: 'brand',
            title: 'Вендор',
            sortable: true,
            render: (record) => (
              <Text size="sm" fw={600}>
                {record.brand || '—'}
              </Text>
            ),
          },
          {
            accessor: 'sku',
            title: 'Артикул',
            sortable: false,
            render: (record) => (
              <Text size="sm">
                {(record as ProductRecord).sku || `SKU${record.id.toString().padStart(4, '0')}`}
              </Text>
            ),
          },
          {
            accessor: 'rating',
            title: 'Оценка',
            sortable: true,
            render: (record) => (
              <Text
                size="sm"
                c={record.rating < 3.5 ? 'red' : undefined}
                fw={record.rating < 3.5 ? 600 : undefined}
              >
                {record.rating.toFixed(1)}/5
              </Text>
            ),
          },
          {
            accessor: 'price',
            title: 'Цена, ₽',
            sortable: true,
            textAlign: 'right',
            render: (record) => (
              <Text size="sm" ta="right">
                {record.price.toLocaleString('ru-RU', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            ),
          },
          {
            accessor: 'actions',
            title: '',
            width: 80,
            render: () => (
              <Group gap={4} wrap="nowrap" justify="flex-end">
                <ActionIcon variant="filled" color="blue" radius="xl" size="sm">
                  <IconPlus size={14} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="gray" radius="xl" size="sm">
                  <IconDotsCircleHorizontal size={18} />
                </ActionIcon>
              </Group>
            ),
          },
        ]}
      />

      {/* Pagination footer */}
      <Flex justify="space-between" align="center" mt="md">
        <Text size="sm" c="dimmed">
          Показано{' '}
          <Text span fw={600}>
            {total === 0 ? 0 : skip + 1}-{Math.min(skip + PAGE_SIZE, total)}
          </Text>{' '}
          из {total}
        </Text>
        {totalPages > 1 && (
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            size="sm"
          />
        )}
      </Flex>

      <AddProductModal opened={modalOpened} onClose={() => setModalOpened(false)} />
    </Box>
  );
}
