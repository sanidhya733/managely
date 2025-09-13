import React from 'react';
import { useEMS, TaskStatus } from '@/contexts/EMSContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar,
  User,
  FileText,
  ClipboardList
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeTaskViewProps {
  employeeId: string;
}

const EmployeeTaskView: React.FC<EmployeeTaskViewProps> = ({ employeeId }) => {
  const { getEmployeeTasks, updateTaskStatus, employees } = useEMS();
  const { toast } = useToast();

  const myTasks = getEmployeeTasks(employeeId);

  const handleAcceptTask = (taskId: string) => {
    updateTaskStatus(taskId, 'accepted');
    toast({
      title: "Task Accepted",
      description: "You have accepted this task and can now work on it.",
    });
  };

  const handleCompleteTask = (taskId: string) => {
    updateTaskStatus(taskId, 'completed');
    toast({
      title: "Task Completed",
      description: "Great job! The task has been marked as completed.",
    });
  };

  const getStatusBadge = (status: TaskStatus) => {
    const variants = {
      pending: { variant: 'destructive' as const, icon: AlertCircle, text: 'Pending' },
      accepted: { variant: 'secondary' as const, icon: Clock, text: 'In Progress' },
      completed: { variant: 'default' as const, icon: CheckCircle2, text: 'Completed' }
    };

    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAssignerName = (assignerId: string) => {
    if (assignerId === '1') return 'Admin';
    const assigner = employees.find(emp => emp.id === assignerId);
    return assigner?.name || 'Unknown';
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    return status !== 'completed' && new Date(dueDate) < new Date();
  };

  // Group tasks by status
  const pendingTasks = myTasks.filter(task => task.status === 'pending');
  const inProgressTasks = myTasks.filter(task => task.status === 'accepted');
  const completedTasks = myTasks.filter(task => task.status === 'completed');

  const TaskCard: React.FC<{ task: any }> = ({ task }) => (
    <Card className="gradient-card shadow-corporate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">{task.title}</CardTitle>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {getAssignerName(task.assignedBy)}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due: {formatDate(task.dueDate)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(task.status)}
            {isOverdue(task.dueDate, task.status) && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {task.description && (
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <FileText className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Description</span>
            </div>
            <p className="text-sm text-foreground">{task.description}</p>
          </div>
        )}
        
        <div className="flex gap-2">
          {task.status === 'pending' && (
            <Button
              onClick={() => handleAcceptTask(task.id)}
              size="sm"
              className="gradient-primary text-white"
            >
              Accept Task
            </Button>
          )}
          
          {task.status === 'accepted' && (
            <Button
              onClick={() => handleCompleteTask(task.id)}
              size="sm"
              variant="outline"
              className="border-success text-success hover:bg-success hover:text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
          )}
          
          {task.status === 'completed' && task.completedDate && (
            <div className="text-sm text-muted-foreground">
              Completed on {formatDate(task.completedDate)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (myTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No Tasks Assigned</h3>
        <p className="text-muted-foreground">
          You don't have any tasks assigned to you at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            Pending Tasks ({pendingTasks.length})
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Tasks */}
      {inProgressTasks.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            In Progress ({inProgressTasks.length})
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Completed ({completedTasks.length})
          </h4>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTaskView;