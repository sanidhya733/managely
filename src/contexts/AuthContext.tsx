import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

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
  session: Session | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (userData: { name: string; email: string; password: string; department: string; position: string }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlock
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Profile fetch error:', error);
                setUser(null);
              } else if (profile) {
                setUser({
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  role: profile.role as UserRole,
                  department: profile.department
                });
              }
              setLoading(false);
            } catch (error) {
              console.error('Profile fetch error:', error);
              setUser(null);
              setLoading(false);
            }
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      
      if (session?.user) {
        try {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Initial profile fetch error:', error);
            setUser(null);
          } else if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              role: profile.role as UserRole,
              department: profile.department
            });
          }
        } catch (error) {
          console.error('Initial profile fetch error:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Session check error:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        // Check if user has the correct role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== role) {
          await supabase.auth.signOut();
          toast({
            title: "Login failed",
            description: `You don't have ${role} access`,
            variant: "destructive"
          });
          return false;
        }

        toast({
          title: "Login successful",
          description: "Welcome back!"
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error?.code === 'email_not_confirmed') {
        toast({
          title: "Email Not Confirmed",
          description: "Please check your email and click the confirmation link before logging in.",
          variant: "destructive"
        });
      } else if (error?.code === 'invalid_credentials') {
        toast({
          title: "Invalid Credentials",
          description: "Please check your email and password and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Login failed",
          description: error?.message || "An unexpected error occurred",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const register = async (userData: { name: string; email: string; password: string; department: string; position: string }): Promise<boolean> => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData.name,
            role: 'employee',
            department: userData.department,
            position: userData.position
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        toast({
          title: "Registration successful",
          description: "Please check your email to verify your account before logging in"
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Explicitly clear the session and user state
      setSession(null);
      setUser(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!session,
    loading
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

