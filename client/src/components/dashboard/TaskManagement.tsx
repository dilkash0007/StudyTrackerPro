import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, Plus, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task, UpdateTaskInput } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function TaskManagement() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: null as Date | null,
    priority: "medium",
    subject: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await apiRequest("POST", "/api/tasks", taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsAddTaskOpen(false);
      setNewTask({
        title: "",
        description: "",
        dueDate: null,
        priority: "medium",
        subject: "",
      });
      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating task",
        description:
          error.message || "An error occurred while creating the task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateTaskInput }) => {
      const res = await apiRequest("PUT", `/api/tasks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating task",
        description:
          error.message || "An error occurred while updating the task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/tasks/${id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting task",
        description:
          error.message || "An error occurred while deleting the task",
        variant: "destructive",
      });
    },
  });

  const handleToggleComplete = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      data: { completed: !task.completed },
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-green-100 text-green-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubjectColor = (subject: string) => {
    const subjectColors: Record<string, string> = {
      Physics: "bg-blue-100 text-blue-800",
      Math: "bg-purple-100 text-purple-800",
      History: "bg-green-100 text-green-800",
      Chemistry: "bg-indigo-100 text-indigo-800",
      Biology: "bg-pink-100 text-pink-800",
      English: "bg-yellow-100 text-yellow-800",
      "Computer Science": "bg-teal-100 text-teal-800",
    };

    return subjectColors[subject] || "bg-gray-100 text-gray-800";
  };

  const getDueDateLabel = (dueDate: Date | undefined) => {
    if (!dueDate) return "No due date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueDateObj = new Date(dueDate);
    dueDateObj.setHours(0, 0, 0, 0);

    if (dueDateObj.getTime() === today.getTime()) return "Due Today";
    if (dueDateObj.getTime() === tomorrow.getTime()) return "Tomorrow";

    const diff = Math.floor(
      (dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff < 0) return "Overdue";
    if (diff < 7) return `In ${diff} days`;

    return format(dueDate, "MMM d, yyyy");
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-medium">Task Management</CardTitle>
        <div className="flex">
          <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="mr-2">
                <Plus className="mr-1 h-4 w-4" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Task title"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Task description"
                      value={newTask.description}
                      onChange={(e) =>
                        setNewTask({ ...newTask, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, priority: value })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={newTask.subject}
                        onValueChange={(value) =>
                          setNewTask({ ...newTask, subject: value })
                        }
                      >
                        <SelectTrigger id="subject">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Math">Math</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Computer Science">
                              Computer Science
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                        >
                          {newTask.dueDate
                            ? format(newTask.dueDate, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate || undefined}
                          onSelect={(date) =>
                            setNewTask({ ...newTask, dueDate: date })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddTaskOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending
                      ? "Creating..."
                      : "Create Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>All Tasks</DropdownMenuItem>
              <DropdownMenuItem>By Priority</DropdownMenuItem>
              <DropdownMenuItem>By Due Date</DropdownMenuItem>
              <DropdownMenuItem>By Subject</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => handleToggleComplete(task)}
                      />
                      <label
                        htmlFor={`task-${task.id}`}
                        className={`ml-3 text-sm font-medium ${
                          task.completed
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                      >
                        {task.title}
                      </label>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(task.priority)}`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}{" "}
                        Priority
                      </Badge>
                      {task.subject && (
                        <Badge
                          variant="outline"
                          className={`ml-2 ${getSubjectColor(task.subject)}`}
                        >
                          {task.subject}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <div className="py-4 text-center text-gray-500">
                No tasks found. Create one to get started!
              </div>
            )}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t bg-gray-50 p-2">
        <Button variant="link" className="text-primary">
          View all tasks <span className="ml-1">→</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
