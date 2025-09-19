import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Users, UserCheck, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    position: ''
  });
  
  const { login, register } = useAuth();
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.department || !registerForm.position) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await register(registerForm);
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: "Employee account created successfully. You can now log in.",
        });
        setIsRegistering(false);
        setRegisterForm({ name: '', email: '', password: '', department: '', position: '' });
      } else {
        toast({
          title: "Registration Failed",
          description: "Email already exists or registration failed",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRegisterForm = (field: string, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Employee Management System</h1>
          <p className="text-white/80">
            {isRegistering ? 'Register as a new employee' : 'Sign in to access your dashboard'}
          </p>
        </div>

        <Card className="glass-card shadow-corporate">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {isRegistering ? 'Register Employee' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isRegistering ? (
              <>
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

                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRegistering(true)}
                    className="text-primary hover:text-primary/80"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    New employee? Register here
                  </Button>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={registerForm.name}
                      onChange={(e) => updateRegisterForm('name', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={registerForm.email}
                      onChange={(e) => updateRegisterForm('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) => updateRegisterForm('password', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Select value={registerForm.department} onValueChange={(value) => updateRegisterForm('department', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="HR">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="Position/Job Title"
                      value={registerForm.position}
                      onChange={(e) => updateRegisterForm('position', e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Register Employee'}
                  </Button>
                </form>

                <div className="mt-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsRegistering(false)}
                    className="text-primary hover:text-primary/80"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;