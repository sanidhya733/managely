import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEMS } from '@/contexts/EMSContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Calendar, 
  ClipboardList, 
  LogOut,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import EmployeeAttendanceView from '@/components/EmployeeAttendanceView';
import EmployeeTaskView from '@/components/EmployeeTaskView';

const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { employees, getAttendanceStats, getEmployeeTasks } = useEMS();
  const [activeTab, setActiveTab] = useState('attendance');

  if (!user) return null;

  // Find the employee record for the current user
  const currentEmployee = employees.find(emp => emp.userId === user.id);
  const employeeId = currentEmployee?.id;

  if (!employeeId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Employee record not found</p>
          <Button onClick={logout} className="mt-4">Logout</Button>
        </div>
      </div>
    );
  }

  // Calculate stats for current month using employee ID
  const currentMonth = new Date().toISOString().substring(0, 7);
  const attendanceStats = getAttendanceStats(employeeId, currentMonth);
  const myTasks = getEmployeeTasks(employeeId);
  
  const taskStats = {
    total: myTasks.length,
    pending: myTasks.filter(t => t.status === 'pending').length,
    accepted: myTasks.filter(t => t.status === 'accepted').length,
    completed: myTasks.filter(t => t.status === 'completed').length
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary shadow-corporate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Employee Dashboard</h1>
                <p className="text-sm text-white/80">Welcome back, {user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-white/80">{user.department}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-white border-white/30 hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="gradient-card shadow-corporate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Days</p>
                  <p className="text-3xl font-bold text-success">{attendanceStats.present}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-corporate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overtime Days</p>
                  <p className="text-3xl font-bold text-warning">{attendanceStats.overtime}</p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-corporate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">My Tasks</p>
                  <p className="text-3xl font-bold text-info">{taskStats.total}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-corporate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <p className="text-3xl font-bold text-destructive">{taskStats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-corporate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              My Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="attendance" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  My Attendance
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  My Tasks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attendance" className="mt-6">
                <EmployeeAttendanceView employeeId={employeeId} />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <EmployeeTaskView employeeId={employeeId} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;