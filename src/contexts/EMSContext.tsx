import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AttendanceStatus = 'present' | 'absent' | 'overtime' | 'halfday';
export type TaskStatus = 'pending' | 'accepted' | 'completed';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  createdDate: string;
  dueDate: string;
  completedDate?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  joinDate: string;
  userId?: string;
}

interface EMSContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  loading: boolean;
  markAttendance: (employeeId: string, status: AttendanceStatus, date: string) => Promise<void>;
  createTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  getEmployeeAttendance: (employeeId: string, month?: string) => AttendanceRecord[];
  getEmployeeTasks: (employeeId: string) => Task[];
  getAttendanceStats: (employeeId: string, month?: string) => Record<AttendanceStatus, number>;
  refreshData: () => Promise<void>;
}

const EMSContext = createContext<EMSContextType | undefined>(undefined);

export const EMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      const formattedEmployees: Employee[] = data.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        joinDate: emp.join_date,
        userId: emp.user_id
      }));
      
      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive"
      });
    }
  };
  
  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      const formattedAttendance: AttendanceRecord[] = data.map(att => ({
        id: att.id,
        employeeId: att.employee_id,
        date: att.date,
        status: att.status as AttendanceStatus,
        notes: att.notes || undefined
      }));
      
      setAttendance(formattedAttendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive"
      });
    }
  };
  
  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_date', { ascending: false });
        
      if (error) throw error;
      
      const formattedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedTo: task.assigned_to,
        assignedBy: task.assigned_by,
        status: task.status as TaskStatus,
        createdDate: task.created_date,
        dueDate: task.due_date,
        completedDate: task.completed_date || undefined
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    }
  };
  
  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchEmployees(),
      fetchAttendance(),
      fetchTasks()
    ]);
    setLoading(false);
  };
  
  useEffect(() => {
    refreshData();
  }, []);

  const markAttendance = async (employeeId: string, status: AttendanceStatus, date: string) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .upsert({
          employee_id: employeeId,
          date,
          status
        }, {
          onConflict: 'employee_id,date'
        });

      if (error) throw error;

      // Refresh attendance data
      await fetchAttendance();
      
      toast({
        title: "Success",
        description: "Attendance marked successfully"
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive"
      });
    }
  };

  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          assigned_to: taskData.assignedTo,
          assigned_by: taskData.assignedBy,
          status: taskData.status,
          created_date: taskData.createdDate,
          due_date: taskData.dueDate,
          completed_date: taskData.completedDate || null
        });

      if (error) throw error;

      // Refresh tasks data
      await fetchTasks();
      
      toast({
        title: "Success",
        description: "Task created successfully"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updateData: any = { status };
      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Refresh tasks data
      await fetchTasks();
      
      toast({
        title: "Success",
        description: "Task status updated successfully"
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const getEmployeeAttendance = (employeeId: string, month?: string) => {
    return attendance.filter(record => {
      if (record.employeeId !== employeeId) return false;
      if (month) {
        const recordMonth = record.date.substring(0, 7); // YYYY-MM format
        return recordMonth === month;
      }
      return true;
    });
  };

  const getEmployeeTasks = (employeeId: string) => {
    return tasks.filter(task => task.assignedTo === employeeId);
  };

  const getAttendanceStats = (employeeId: string, month?: string) => {
    const records = getEmployeeAttendance(employeeId, month);
    const stats: Record<AttendanceStatus, number> = {
      present: 0,
      absent: 0,
      overtime: 0,
      halfday: 0
    };

    records.forEach(record => {
      stats[record.status]++;
    });

    return stats;
  };

  const value: EMSContextType = {
    employees,
    attendance,
    tasks,
    loading,
    markAttendance,
    createTask,
    updateTaskStatus,
    getEmployeeAttendance,
    getEmployeeTasks,
    getAttendanceStats,
    refreshData
  };

  return <EMSContext.Provider value={value}>{children}</EMSContext.Provider>;
};

export const useEMS = () => {
  const context = useContext(EMSContext);
  if (context === undefined) {
    throw new Error('useEMS must be used within an EMSProvider');
  }
  return context;
};