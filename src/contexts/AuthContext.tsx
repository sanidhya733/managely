import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    department: 'Management'
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'employee',
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'employee',
    department: 'Design'
  },
  {
    id: '4',
    name: 'Mike Wilson',
    email: 'mike@company.com',
    role: 'employee',
    department: 'Marketing'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email and role
    const foundUser = mockUsers.find(u => u.email === email && u.role === role);
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { mockUsers };