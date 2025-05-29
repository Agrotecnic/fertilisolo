import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { Container, Paper } from '@mantine/core';

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('login');

  const handleLoginSuccess = () => {
    navigate('/');
  };

  const handleSignupSuccess = () => {
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <Header subtitle="Calculadora de Adubação" description={null} />
      
      <Container size="sm" className="flex-1 flex flex-col justify-center items-center p-4">
        <Paper shadow="xs" radius="md" p="xl" className="w-full max-w-md bg-white border border-secondary-dark/10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-bg-lighter">
              <TabsTrigger 
                value="login" 
                className="font-inter font-medium data-[state=active]:bg-primary-dark data-[state=active]:text-white"
              >
                Login
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="font-inter font-medium data-[state=active]:bg-primary-dark data-[state=active]:text-white"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm onSignupSuccess={handleSignupSuccess} />
            </TabsContent>
          </Tabs>
        </Paper>
      </Container>
    </div>
  );
};

export default Auth; 