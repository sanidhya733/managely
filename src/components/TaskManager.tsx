import React, { useState } from 'react';
import { useEMS, Task } from '@/contexts/EMSContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TaskManager: React.FC = () => {
  const { employees, tasks, createTask } = useEMS();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: ''
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const taskData = {
      ...newTask,
      assignedBy: user?.id || '1',
      status: 'pending' as const,
      createdDate: new Date().toISOString().split('T')[0]
    };

    createTask(taskData);
    
    toast({
      title: "Task Created",
      description: `Task "${newTask.title}" has been assigned successfully`,
    });

    setNewTask({ title: '', description: '', assignedTo: '', dueDate: '' });
    setIsCreateDialogOpen(false);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const getStatusBadge = (status: Task['status']) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Management</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="assignedTo">Assign To *</Label>
                <Select
                  value={newTask.assignedTo}
                  onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {employee.name} - {employee.department}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 gradient-primary text-white">
                  Create Task
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No tasks created yet. Create your first task to get started.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        {getEmployeeName(task.assignedTo)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {formatDate(task.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(task.createdDate)}
                    </TableCell>
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

export default TaskManager;