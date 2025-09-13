import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  markAttendance: (employeeId: string, status: AttendanceStatus, date: string) => void;
  createTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  getEmployeeAttendance: (employeeId: string, month?: string) => AttendanceRecord[];
  getEmployeeTasks: (employeeId: string) => Task[];
  getAttendanceStats: (employeeId: string, month?: string) => Record<AttendanceStatus, number>;
}

const EMSContext = createContext<EMSContextType | undefined>(undefined);

// Mock data
const mockEmployees: Employee[] = [
  {
    id: '2',
    name: 'John Smith',
    email: 'john@company.com',
    department: 'Engineering',
    position: 'Frontend Developer',
    joinDate: '2023-01-15'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    department: 'Design',
    position: 'UI/UX Designer',
    joinDate: '2023-02-01'
  },
  {
    id: '4',
    name: 'Mike Wilson',
    email: 'mike@company.com',
    department: 'Marketing',
    position: 'Marketing Specialist',
    joinDate: '2023-03-01'
  }
];

const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  mockEmployees.forEach(employee => {
    for (let day = 1; day <= 30; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date <= currentDate) {
        const statuses: AttendanceStatus[] = ['present', 'present', 'present', 'present', 'absent', 'overtime', 'halfday'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        records.push({
          id: `${employee.id}-${date.toISOString().split('T')[0]}`,
          employeeId: employee.id,
          date: date.toISOString().split('T')[0],
          status: randomStatus
        });
      }
    }
  });
  
  return records;
};

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Update User Dashboard',
    description: 'Implement new features for the user dashboard including analytics widgets',
    assignedTo: '2',
    assignedBy: '1',
    status: 'accepted',
    createdDate: '2024-01-10',
    dueDate: '2024-01-20'
  },
  {
    id: '2',
    title: 'Design System Documentation',
    description: 'Create comprehensive documentation for the design system components',
    assignedTo: '3',
    assignedBy: '1',
    status: 'completed',
    createdDate: '2024-01-05',
    dueDate: '2024-01-15',
    completedDate: '2024-01-14'
  },
  {
    id: '3',
    title: 'Marketing Campaign Analysis',
    description: 'Analyze the performance of Q4 marketing campaigns and prepare report',
    assignedTo: '4',
    assignedBy: '1',
    status: 'pending',
    createdDate: '2024-01-12',
    dueDate: '2024-01-25'
  }
];

export const EMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(generateMockAttendance());
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  // Listen for new employee registrations
  React.useEffect(() => {
    const handleNewEmployee = (event: CustomEvent) => {
      const newEmployee: Employee = event.detail;
      setEmployees(prev => [...prev, newEmployee]);
    };

    window.addEventListener('newEmployeeRegistered', handleNewEmployee as EventListener);
    return () => {
      window.removeEventListener('newEmployeeRegistered', handleNewEmployee as EventListener);
    };
  }, []);

  const markAttendance = (employeeId: string, status: AttendanceStatus, date: string) => {
    setAttendance(prev => {
      const existingIndex = prev.findIndex(a => a.employeeId === employeeId && a.date === date);
      const newRecord: AttendanceRecord = {
        id: `${employeeId}-${date}`,
        employeeId,
        date,
        status
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newRecord;
        return updated;
      } else {
        return [...prev, newRecord];
      }
    });
  };

  const createTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status, 
            completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined 
          }
        : task
    ));
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
    markAttendance,
    createTask,
    updateTaskStatus,
    getEmployeeAttendance,
    getEmployeeTasks,
    getAttendanceStats
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