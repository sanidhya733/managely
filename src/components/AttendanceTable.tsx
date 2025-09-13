import React, { useState } from 'react';
import { useEMS, AttendanceStatus } from '@/contexts/EMSContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, UserX, Clock, Timer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AttendanceTable: React.FC = () => {
  const { employees, markAttendance, getEmployeeAttendance } = useEMS();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleMarkAttendance = (employeeId: string, status: AttendanceStatus) => {
    markAttendance(employeeId, status, selectedDate);
    toast({
      title: "Attendance Updated",
      description: `Attendance marked as ${status} for ${selectedDate}`,
    });
  };

  const getAttendanceForDate = (employeeId: string) => {
    const records = getEmployeeAttendance(employeeId);
    return records.find(record => record.date === selectedDate)?.status;
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <UserCheck className="w-4 h-4" />;
      case 'absent':
        return <UserX className="w-4 h-4" />;
      case 'overtime':
        return <Timer className="w-4 h-4" />;
      case 'halfday':
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus | undefined) => {
    if (!status) return <Badge variant="outline">Not Marked</Badge>;

    const variants = {
      present: 'default',
      absent: 'destructive',
      overtime: 'secondary',
      halfday: 'outline'
    } as const;

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Employee Attendance</h3>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const currentStatus = getAttendanceForDate(employee.id);
                return (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{getStatusBadge(currentStatus)}</TableCell>
                    <TableCell>
                      <Select
                        value={currentStatus || ''}
                        onValueChange={(value) => handleMarkAttendance(employee.id, value as AttendanceStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Mark..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-success" />
                              Present
                            </div>
                          </SelectItem>
                          <SelectItem value="absent">
                            <div className="flex items-center gap-2">
                              <UserX className="w-4 h-4 text-destructive" />
                              Absent
                            </div>
                          </SelectItem>
                          <SelectItem value="overtime">
                            <div className="flex items-center gap-2">
                              <Timer className="w-4 h-4 text-warning" />
                              Overtime
                            </div>
                          </SelectItem>
                          <SelectItem value="halfday">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-info" />
                              Half Day
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTable;