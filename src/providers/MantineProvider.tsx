import { MantineProvider as BaseMantineProvider, createTheme } from '@mantine/core';
import React from 'react';

const theme = createTheme({
  colors: {
    'primary-green': [
      '#E8F5E9', // 0
      '#C8E6C9', // 1
      '#A5D6A7', // 2
      '#81C784', // 3
      '#66BB6A', // 4
      '#4CAF50', // 5
      '#43A047', // 6
      '#388E3C', // 7
      '#2E7D32', // 8
      '#1B5E20', // 9
    ],
    'blue-corp': [
      '#E3F2FD', // 0
      '#BBDEFB', // 1
      '#90CAF9', // 2
      '#64B5F6', // 3
      '#42A5F5', // 4
      '#2196F3', // 5
      '#1E88E5', // 6
      '#1976D2', // 7
      '#1565C0', // 8
      '#0D47A1', // 9
    ],
    'orange-terra': [
      '#FFF8E1', // 0
      '#FFECB3', // 1
      '#FFE082', // 2
      '#FFD54F', // 3
      '#FFCA28', // 4
      '#FFC107', // 5
      '#FFB300', // 6
      '#FFA000', // 7
      '#FF8F00', // 8
      '#FF6F00', // 9
    ],
    'neutral-gray': [
      '#ECEFF1', // 0
      '#CFD8DC', // 1
      '#B0BEC5', // 2
      '#90A4AE', // 3
      '#78909C', // 4
      '#607D8B', // 5
      '#546E7A', // 6
      '#455A64', // 7
      '#37474F', // 8
      '#263238', // 9
    ],
  },
  primaryColor: 'primary-green',
  primaryShade: 9,
  fontFamily: 'Roboto, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',
  headings: {
    fontFamily: 'Inter, sans-serif',
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: {
        color: 'primary-green',
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
    },
  },
});

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider theme={theme} defaultColorScheme="light">
      {children}
    </BaseMantineProvider>
  );
} 