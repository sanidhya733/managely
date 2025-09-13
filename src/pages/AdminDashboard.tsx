import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEMS, AttendanceStatus } from '@/contexts/EMSContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  LogOut,
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import AttendanceTable from '@/components/AttendanceTable';
import TaskManager from '@/components/TaskManager';
import EmployeeReports from '@/components/EmployeeReports';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { employees, getAttendanceStats, tasks } = useEMS();
  const [activeTab, setActiveTab] = useState('employees');

  // Calculate dashboard stats
  const totalEmployees = employees.length;
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  const todayAttendanceStats = employees.reduce((stats, emp) => {
    const empStats = getAttendanceStats(emp.id, currentMonth);
    stats.present += empStats.present;
    stats.absent += empStats.absent;
    stats.overtime += empStats.overtime;
    stats.halfday += empStats.halfday;
    return stats;
  }, { present: 0, absent: 0, overtime: 0, halfday: 0 });

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'accepted').length,
    completed: tasks.filter(t => t.status === 'completed').length
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
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Admin Dashboard</h1>
                <p className="text-sm text-white/80">Employee Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-white/80">{user?.email}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                  <p className="text-3xl font-bold text-primary">{totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-corporate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                  <p className="text-3xl font-bold text-success">{todayAttendanceStats.present}</p>
                </div>
                <UserCheck className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card shadow-corporate">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                  <p className="text-3xl font-bold text-primary">{taskStats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="shadow-corporate">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Management Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="employees" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Tasks
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="employees" className="mt-6">
                <AttendanceTable />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <TaskManager />
              </TabsContent>

              <TabsContent value="reports" className="mt-6">
                <EmployeeReports />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;