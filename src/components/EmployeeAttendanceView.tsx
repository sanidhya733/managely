import React, { useState } from 'react';
import { useEMS } from '@/contexts/EMSContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  TrendingUp, 
  UserCheck, 
  UserX, 
  Clock, 
  Timer 
} from 'lucide-react';

interface EmployeeAttendanceViewProps {
  employeeId: string;
}

const EmployeeAttendanceView: React.FC<EmployeeAttendanceViewProps> = ({ employeeId }) => {
  const { getEmployeeAttendance, getAttendanceStats } = useEMS();
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

  const attendanceRecords = getEmployeeAttendance(employeeId, selectedMonth);
  const attendanceStats = getAttendanceStats(employeeId, selectedMonth);
  
  const totalDays = Object.values(attendanceStats).reduce((sum, count) => sum + count, 0);
  const presentPercentage = totalDays > 0 ? (attendanceStats.present / totalDays) * 100 : 0;

  const getStatusBadge = (status: string) => {
    const variants = {
      present: { variant: 'default' as const, icon: UserCheck, color: 'text-success' },
      absent: { variant: 'destructive' as const, icon: UserX, color: 'text-destructive' },
      overtime: { variant: 'secondary' as const, icon: Timer, color: 'text-warning' },
      halfday: { variant: 'outline' as const, icon: Clock, color: 'text-info' }
    };

    const config = variants[status as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          My Attendance
        </h3>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-primary">{presentPercentage.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>

        {Object.entries(attendanceStats).map(([status, count]) => {
          const icons = {
            present: { icon: UserCheck, color: 'text-success', bg: 'bg-success/10' },
            absent: { icon: UserX, color: 'text-destructive', bg: 'bg-destructive/10' },
            overtime: { icon: Timer, color: 'text-warning', bg: 'bg-warning/10' },
            halfday: { icon: Clock, color: 'text-info', bg: 'bg-info/10' }
          };

          const config = icons[status as keyof typeof icons];
          const Icon = config.icon;

          return (
            <Card key={status} className="gradient-card">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`w-6 h-6 mx-auto mb-2 ${config.bg} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Attendance Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Present Days: {attendanceStats.present}</span>
              <span>Total Days: {totalDays}</span>
            </div>
            <Progress value={presentPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No attendance records found for the selected month.
                  </TableCell>
                </TableRow>
              ) : (
                attendanceRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAttendanceView;