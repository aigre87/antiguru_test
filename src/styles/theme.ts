'use client';

import { createTheme, MantineColorsTuple } from '@mantine/core';

const primary: MantineColorsTuple = [
  "#eceeff",
  "#d6d8fc",
  "#a9adf2",
  "#7a80e9",
  "#535ae1",
  "#3a42dd",
  "#242edb",
  "#1e29c4",
  "#1724b0",
  "#0a1d9c"
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary,
  },
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
});
