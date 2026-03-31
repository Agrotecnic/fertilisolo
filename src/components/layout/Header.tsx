import React from 'react';
import { Text, Group, Box, Container } from '@mantine/core';
import { DynamicLogo } from '@/components/DynamicLogo';

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
    <Box className="py-3 md:py-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
      <Container size="lg" className="px-4">
        <div className="text-center">
          <Group justify="center" className="mb-2 md:mb-4">
            <DynamicLogo size="md" className="h-8 md:h-12" />
            <Text className="text-2xl md:text-4xl font-bold text-primary" style={{ fontFamily: "Inter, sans-serif" }}>
              {title}
            </Text>
          </Group>
          
          <Text className="text-base md:text-xl text-secondary max-w-3xl mx-auto font-medium px-2">
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