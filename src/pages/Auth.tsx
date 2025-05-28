import React, { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { SignupForm } from '@/components/SignupForm';
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col justify-center items-center p-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Leaf className="h-12 w-12 text-green-600 mr-3" />
          <h1 className="text-4xl font-bold text-green-800">Fertilisolo</h1>
        </div>
        <p className="text-xl text-green-700">
          Calculadora de Adubação
        </p>
      </div>
      
      <div className="w-full max-w-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Criar Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignupForm onSignupSuccess={handleSignupSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth; 