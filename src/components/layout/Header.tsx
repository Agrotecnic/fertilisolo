import React from 'react';
import { Text, Group, Box, Container } from '@mantine/core';
import { DynamicLogo } from '@/components/DynamicLogo';
import { useTheme } from '@/providers/ThemeProvider';

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
  const { organizationId } = useTheme();
  // Usa data-org-theme para detectar org imediatamente (antes do React state carregar)
  const hasOrgTheme = Boolean(organizationId) || 
    document.documentElement.getAttribute('data-org-theme') === 'true';

  if (hasOrgTheme) {
    // Estilo premium exclusivo para organizações com tema personalizado
    return (
      <Box className="py-4 md:py-8 border-b-4 border-accent bg-primary">
        <Container size="lg" className="px-4">
          <div className="text-center">
            <Group justify="center" className="mb-2 md:mb-3">
              <DynamicLogo size="md" className="h-8 md:h-12" />
              <Text className="text-2xl md:text-4xl font-bold text-primary-foreground font-sans">
                {title}
              </Text>
            </Group>

            <div className="flex justify-center mb-2 md:mb-3">
              <span className="inline-block h-[2px] w-16 md:w-24 rounded-full" style={{ backgroundColor: 'hsl(var(--accent))' }} />
            </div>

            <Text className="text-base md:text-xl text-accent max-w-3xl mx-auto font-semibold px-2 tracking-wide">
              {subtitle}
            </Text>

            {description && (
              <Text className="text-xs md:text-sm text-primary-foreground/70 mt-2 px-2">
                {description}
              </Text>
            )}
          </div>
        </Container>
      </Box>
    );
  }

  // Estilo padrão do Fertilisolo (sem organização específica)
  return (
    <Box className="py-3 md:py-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
      <Container size="lg" className="px-4">
        <div className="text-center">
          <Group justify="center" className="mb-2 md:mb-4">
            <DynamicLogo size="md" className="h-8 md:h-12" />
            <Text className="text-2xl md:text-4xl font-bold text-primary font-sans">
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