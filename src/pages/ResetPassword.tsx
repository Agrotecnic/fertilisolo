import React from 'react';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';
import { Header } from '@/components/layout/Header';
import { Container } from '@mantine/core';

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <Header subtitle="Redefinição de Senha" description={null} />
      
      <Container size="sm" className="flex-1 flex flex-col justify-center items-center p-4">
        <ResetPasswordForm />
      </Container>
    </div>
  );
};

export default ResetPassword; 