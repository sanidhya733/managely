import React, { useState } from 'react';
import { useEMS } from '@/contexts/EMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Clock, 
  Timer, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from 'lucide-react';

const EmployeeReports: React.FC = () => {
  const { employees, getAttendanceStats, getEmployeeTasks } = useEMS();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7));

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7);
      const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      options.push({ value: monthStr, label: displayStr });
    }
    
    return options;
  };

  const getEmployeeReport = (employeeId: string) => {
    const attendanceStats = getAttendanceStats(employeeId, selectedMonth);
    const tasks = getEmployeeTasks(employeeId);
    
    const totalAttendanceDays = Object.values(attendanceStats).reduce((sum, count) => sum + count, 0);
    const presentPercentage = totalAttendanceDays > 0 ? (attendanceStats.present / totalAttendanceDays) * 100 : 0;
    
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'accepted').length,
      pending: tasks.filter(t => t.status === 'pending').length
    };
    
    const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total) * 100 : 0;
    
    return {
      attendanceStats,
      totalAttendanceDays,
      presentPercentage,
      taskStats,
      completionRate
    };
  };

  const getAttendanceIcon = (type: string) => {
    switch (type) {
      case 'present':
        return <UserCheck className="w-4 h-4 text-success" />;
      case 'absent':
        return <UserX className="w-4 h-4 text-destructive" />;
      case 'overtime':
        return <Timer className="w-4 h-4 text-warning" />;
      case 'halfday':
        return <Clock className="w-4 h-4 text-info" />;
      default:
        return null;
    }
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Employee Reports
        </h3>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6">
        {employees.map((employee) => {
          const report = getEmployeeReport(employee.id);
          
          return (
            <Card key={employee.id} className="shadow-corporate">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold">{employee.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {employee.position} • {employee.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {report.presentPercentage.toFixed(1)}% Attendance
                    </Badge>
                    <Badge variant="outline">
                      {report.completionRate.toFixed(1)}% Tasks Completed
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Attendance Section */}
                  <div className="space-y-4">
                    <h5 className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Attendance Summary
                    </h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Attendance Rate</span>
                        <span className="text-sm font-medium">
                          {report.presentPercentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={report.presentPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(report.attendanceStats).map(([type, count]) => (
                        <div key={type} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                          {getAttendanceIcon(type)}
                          <div>
                            <p className="text-xs text-muted-foreground capitalize">{type}</p>
                            <p className="text-sm font-medium">{count} days</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div className="space-y-4">
                    <h5 className="font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Task Performance
                    </h5>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completion Rate</span>
                        <span className="text-sm font-medium">
                          {report.completionRate.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={report.completionRate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <div>
                          <p className="text-xs text-muted-foreground">Completed</p>
                          <p className="text-sm font-medium">{report.taskStats.completed}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Clock className="w-4 h-4 text-warning" />
                        <div>
                          <p className="text-xs text-muted-foreground">In Progress</p>
                          <p className="text-sm font-medium">{report.taskStats.inProgress}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pending</p>
                          <p className="text-sm font-medium">{report.taskStats.pending}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <BarChart3 className="w-4 h-4 text-info" />
                        <div>
                          <p className="text-xs text-muted-foreground">Total</p>
                          <p className="text-sm font-medium">{report.taskStats.total}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EmployeeReports;