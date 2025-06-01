import React from 'react';
import { Text, Group, Box, Container } from '@mantine/core';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  title = "Fertilisolo", 
  subtitle = "Calculadora de Adubação - Método de Saturações por Bases",
  description = "Ferramenta profissional para agrônomos, técnicos agrícolas e produtores rurais"
}) => {
  return (
    <Box className="py-3 md:py-6 border-b border-neutral-light/10 bg-gradient-to-r from-primary-dark/5 to-primary-light/5">
      <Container size="lg" className="px-4">
        <div className="text-center">
          <Group justify="center" className="mb-2 md:mb-4">
            <img src="/logo-fertilisolo.png" alt="Logo FertiliSolo" className="h-8 md:h-12" />
            <Text className="text-2xl md:text-4xl font-bold text-primary-dark" style={{ fontFamily: "Inter, sans-serif" }}>
              {title}
            </Text>
          </Group>
          
          <Text className="text-base md:text-xl text-secondary-dark max-w-3xl mx-auto font-medium px-2">
            {subtitle}
          </Text>
          
          {description && (
            <Text className="text-xs md:text-sm text-neutral-medium mt-2 px-2">
              {description}
            </Text>
          )}
        </div>
      </Container>
    </Box>
  );
}; 