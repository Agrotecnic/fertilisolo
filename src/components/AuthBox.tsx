import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
import { UserType } from '@/lib/supabase';
import { LogoutButton } from './LogoutButton';
import { UserCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface AuthBoxProps {
  user: User | null;
  userType: UserType | null;
}

export const AuthBox: React.FC<AuthBoxProps> = ({ user, userType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
  const email = user.email || '';
  
  // Versão compacta para mobile
  const mobileVersion = (
    <button 
      onClick={() => setIsExpanded(!isExpanded)}
      className="flex items-center gap-1 bg-white/95 shadow-md rounded-full px-3 py-2 border border-gray-200"
    >
      <UserCircle className="h-5 w-5 text-green-600" />
      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  return (
    <>
      {/* Versão mobile (visível apenas em telas pequenas) */}
      <div className="md:hidden">
        {mobileVersion}
        
        {isExpanded && (
          <Card className="absolute top-10 right-0 shadow-lg border-2 bg-white/95 w-64 mt-1 z-50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-green-600" />
                <CardTitle className="text-lg">Usuário</CardTitle>
              </div>
              <div className="text-sm text-gray-600 truncate">{email}</div>
            </CardHeader>
            <CardContent className="pb-3">
              <Badge className={`text-sm px-3 py-1 font-medium ${typeClass}`}>
                {userType.charAt(0).toUpperCase() + userType.slice(1)}
              </Badge>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <LogoutButton />
            </CardFooter>
          </Card>
        )}
      </div>
      
      {/* Versão desktop (visível apenas em telas médias e maiores) */}
      <div className="hidden md:block">
        <Card className="shadow-lg border-2 bg-white/95 w-64">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <UserCircle className="h-6 w-6 text-green-600" />
              <CardTitle className="text-lg">Usuário</CardTitle>
            </div>
            <div className="text-sm text-gray-600 truncate">{email}</div>
          </CardHeader>
          <CardContent className="pb-3">
            <Badge className={`text-sm px-3 py-1 font-medium ${typeClass}`}>
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Badge>
          </CardContent>
          <CardFooter className="pt-0 pb-3">
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </>
  );
}; 