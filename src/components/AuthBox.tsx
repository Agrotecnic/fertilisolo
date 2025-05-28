import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
import { UserType } from '@/lib/supabase';
import { LogoutButton } from './LogoutButton';

interface AuthBoxProps {
  user: User | null;
  userType: UserType | null;
}

export const AuthBox: React.FC<AuthBoxProps> = ({ user, userType }) => {
  if (!user || !userType) {
    return null;
  }

  const typeColorMap: Record<UserType, string> = {
    admin: 'bg-red-100 text-red-800 border-red-200',
    agronomist: 'bg-green-100 text-green-800 border-green-200',
    technician: 'bg-blue-100 text-blue-800 border-blue-200',
    farmer: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  };

  const typeClass = typeColorMap[userType] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <Card className="shadow-md border-2 bg-white/90">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Usuário Autenticado</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <Badge className={`text-sm px-3 py-1 font-medium ${typeClass}`}>
          {userType.charAt(0).toUpperCase() + userType.slice(1)}
        </Badge>
      </CardContent>
      <CardFooter className="pt-2">
        <LogoutButton />
      </CardFooter>
    </Card>
  );
}; 