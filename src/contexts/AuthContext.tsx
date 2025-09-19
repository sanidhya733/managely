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
  register: (userData: { name: string; email: string; password: string; department: string; position: string }) => Promise<boolean>;
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
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email and role
    const foundUser = allUsers.find(u => u.email === email && u.role === role);
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    
    return false;
  };

  const register = async (userData: { name: string; email: string; password: string; department: string; position: string }): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = allUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: (allUsers.length + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: 'employee' as UserRole,
      department: userData.department
    };

    // Add to users list
    setAllUsers(prev => [...prev, newUser]);
    
    // Dispatch custom event to notify EMSContext
    window.dispatchEvent(new CustomEvent('newEmployeeRegistered', { 
      detail: { 
        ...newUser, 
        position: userData.position,
        joinDate: new Date().toISOString().split('T')[0]
      } 
    }));

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
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