import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password, selectedRole);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome to the Employee Management System`,
        });
        
        // Navigate based on role
        if (selectedRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/employee');
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials or user not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Employee Management System</h1>
          <p className="text-white/80">Sign in to access your dashboard</p>
        </div>

        <Card className="glass-card shadow-corporate">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="employee" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Employee
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin" className="mt-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">Demo Credentials</Badge>
                  <p className="text-sm text-muted-foreground">admin@company.com / password</p>
                </div>
              </TabsContent>
              
              <TabsContent value="employee" className="mt-4">
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">Demo Credentials</Badge>
                  <p className="text-sm text-muted-foreground">
                    john@company.com / password<br />
                    sarah@company.com / password<br />
                    mike@company.com / password
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;