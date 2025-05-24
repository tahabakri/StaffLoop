import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CalendarIcon, PlusCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Mock tasks data
const initialTasks = [
  {
    id: 1,
    title: "Confirm venue for Event A",
    dueDate: "2025-05-22",
    assignedTo: "Alex Johnson", 
    completed: false,
    priority: "high"
  },
  {
    id: 2,
    title: "Assign staff to Event B",
    dueDate: "2025-05-21",
    assignedTo: "Sarah Miller",
    completed: false,
    priority: "medium"
  },
  {
    id: 3,
    title: "Order catering for Tech Conference",
    dueDate: "2025-05-25",
    assignedTo: "John Smith",
    completed: true,
    priority: "medium"
  },
  {
    id: 4,
    title: "Review security plan for Summer Festival",
    dueDate: "2025-05-20",
    assignedTo: "Alex Johnson",
    completed: false,
    priority: "high"
  },
  {
    id: 5,
    title: "Send follow-up emails to vendors",
    dueDate: "2025-05-19",
    assignedTo: "Sarah Miller",
    completed: true,
    priority: "low"
  }
];

// Mock staff members for assignments
const staffMembers = [
  { id: 1, name: "Alex Johnson" },
  { id: 2, name: "Sarah Miller" },
  { id: 3, name: "John Smith" },
  { id: 4, name: "Maria Garcia" },
];

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState(initialTasks);
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // New task state
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: new Date(),
    assignedTo: "",
    priority: "medium"
  });
  
  // Handle task completion toggle
  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed } 
        : task
    ));
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "Task Reopened" : "Task Completed",
        description: task.completed 
          ? `"${task.title}" has been marked as incomplete.` 
          : `"${task.title}" has been marked as complete.`,
      });
    }
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "completed" && task.completed) ||
                         (filterStatus === "pending" && !task.completed);
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle new task form input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle date selection
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setNewTask(prev => ({ ...prev, dueDate: date }));
    }
  };
  
  // Handle assignment selection
  const handleAssigneeChange = (value: string) => {
    setNewTask(prev => ({ ...prev, assignedTo: value }));
  };
  
  // Handle priority selection
  const handlePriorityChange = (value: string) => {
    setNewTask(prev => ({ ...prev, priority: value }));
  };
  
  // Add a new task
  const handleAddTask = () => {
    const newTaskEntry = {
      id: tasks.length + 1,
      title: newTask.title,
      dueDate: format(newTask.dueDate, "yyyy-MM-dd"),
      assignedTo: newTask.assignedTo,
      completed: false,
      priority: newTask.priority
    };
    
    setTasks([...tasks, newTaskEntry]);
    
    toast({
      title: "Task Added",
      description: `New task "${newTask.title}" has been added.`,
    });
    
    // Reset form and close dialog
    setNewTask({
      title: "",
      dueDate: new Date(),
      assignedTo: "",
      priority: "medium"
    });
    setShowAddTaskDialog(false);
  };

  return (
    <div className="flex flex-col w-full space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tasks</h1>
        
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task and assign it to a team member.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Name</Label>
                <Input
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleInputChange}
                  placeholder="Confirm venue for Event"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dueDate"
                      variant={"outline"}
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select value={newTask.assignedTo} onValueChange={handleAssigneeChange}>
                  <SelectTrigger id="assignedTo">
                    <SelectValue placeholder="Assign to team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffMembers.map(staff => (
                      <SelectItem key={staff.id} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={handlePriorityChange}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleAddTask}
                disabled={!newTask.title || !newTask.assignedTo}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <Card className="bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex-grow">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-auto">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <Card 
              key={task.id}
              className={`bg-gray-100 p-4 rounded-md transition-colors ${
                task.completed 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <Checkbox 
                  id={`task-${task.id}`} 
                  checked={task.completed} 
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  className="mt-1"
                />
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <label 
                      htmlFor={`task-${task.id}`} 
                      className={`font-medium cursor-pointer ${task.completed ? 'text-gray-500 line-through' : ''}`}
                    >
                      {task.title}
                    </label>
                    
                    <Badge 
                      className={`
                        ${task.priority === 'high' ? 'bg-red-500' : 
                          task.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}
                      `}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <div className="text-sm text-gray-600">
                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-gray-600">
                      Assigned to: {task.assignedTo}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No tasks found matching the criteria.</p>
          </Card>
        )}
      </div>
    </div>
  );
} 