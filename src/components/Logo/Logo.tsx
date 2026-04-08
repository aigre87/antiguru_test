import React from 'react';
import {Box} from "@mantine/core";
import Image from 'next/image';
import styles from './Logo.module.css';

export const Logo = () => {
  return (
    <Box className={styles.root}>
      <Image src="/logo.svg" alt="Logo" width={35} height={34} unoptimized />
    </Box>
  )
};
