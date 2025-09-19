import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

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
}

interface EMSContextType {
  employees: Employee[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  loading: boolean;
  markAttendance: (employeeId: string, status: AttendanceStatus, date: string) => void;
  createTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
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

  // Load data on mount
  React.useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmployees(),
        loadAttendance(),
        loadTasks()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedEmployees: Employee[] = data.map(emp => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        position: emp.position,
        joinDate: emp.join_date
      }));

      setEmployees(formattedEmployees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const formattedAttendance: AttendanceRecord[] = data.map(record => ({
        id: record.id,
        employeeId: record.employee_id,
        date: record.date,
        status: record.status,
        notes: record.notes || undefined
      }));

      setAttendance(formattedAttendance);
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        assignedTo: task.assigned_to,
        assignedBy: task.assigned_by,
        status: task.status,
        createdDate: task.created_date,
        dueDate: task.due_date,
        completedDate: task.completed_date || undefined
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const markAttendance = async (employeeId: string, status: AttendanceStatus, date: string) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .upsert({
          employee_id: employeeId,
          date,
          status
        }, {
          onConflict: 'employee_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setAttendance(prev => {
        const existingIndex = prev.findIndex(a => a.employeeId === employeeId && a.date === date);
        const newRecord: AttendanceRecord = {
          id: data.id,
          employeeId: data.employee_id,
          date: data.date,
          status: data.status,
          notes: data.notes || undefined
        };

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRecord;
          return updated;
        } else {
          return [...prev, newRecord];
        }
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const { data, error } = await supabase
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
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        assignedTo: data.assigned_to,
        assignedBy: data.assigned_by,
        status: data.status,
        createdDate: data.created_date,
        dueDate: data.due_date,
        completedDate: data.completed_date || undefined
      };

      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updateData.completed_date = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { 
              ...task, 
              status: data.status, 
              completedDate: data.completed_date || undefined 
            }
          : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
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