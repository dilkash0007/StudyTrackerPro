import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Event, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isSameDay } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const eventFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  location: z.string().optional(),
  color: z.string().default("#4F46E5"),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Events data
  const { data: events, isLoading: isLoadingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Tasks data
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Event form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
      location: "",
      color: "#4F46E5",
    },
  });
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormValues) => {
      const res = await apiRequest("POST", "/api/events", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsAddEventOpen(false);
      form.reset();
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating event",
        description: error.message || "An error occurred while creating the event",
        variant: "destructive",
      });
    },
  });
  
  // Filter events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate || !events) return [];
    
    return events.filter(event => 
      isSameDay(new Date(event.startTime), selectedDate)
    ).sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  };
  
  // Filter tasks for selected date
  const getTasksForSelectedDate = () => {
    if (!selectedDate || !tasks) return [];
    
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
    ).sort((a, b) => a.completed === b.completed ? 0 : a.completed ? 1 : -1);
  };
  
  const selectedDateEvents = getEventsForSelectedDate();
  const selectedDateTasks = getTasksForSelectedDate();
  
  // Calculate dates with events for the calendar
  const getDatesWithData = () => {
    if (!events && !tasks) return [];
    
    const dates = new Set<string>();
    
    if (events) {
      events.forEach(event => {
        dates.add(format(new Date(event.startTime), 'yyyy-MM-dd'));
      });
    }
    
    if (tasks) {
      tasks.forEach(task => {
        if (task.dueDate) {
          dates.add(format(new Date(task.dueDate), 'yyyy-MM-dd'));
        }
      });
    }
    
    return Array.from(dates).map(dateStr => new Date(dateStr));
  };
  
  const handleSubmit = (data: EventFormValues) => {
    createEventMutation.mutate(data);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate">
                Calendar
              </h2>
              
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Event title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Event description (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date and time</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDate = new Date(field.value);
                                        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                        field.onChange(newDate);
                                      }
                                    }}
                                    initialFocus
                                  />
                                  <div className="p-3 border-t border-border">
                                    <Input
                                      type="time"
                                      value={format(field.value, "HH:mm")}
                                      onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(field.value);
                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                        field.onChange(newDate);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>End Time</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date and time</span>
                                      )}
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDate = new Date(field.value);
                                        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                                        field.onChange(newDate);
                                      }
                                    }}
                                    initialFocus
                                  />
                                  <div className="p-3 border-t border-border">
                                    <Input
                                      type="time"
                                      value={format(field.value, "HH:mm")}
                                      onChange={(e) => {
                                        const [hours, minutes] = e.target.value.split(':');
                                        const newDate = new Date(field.value);
                                        newDate.setHours(parseInt(hours), parseInt(minutes));
                                        field.onChange(newDate);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Event location (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a color" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="#4F46E5" className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-primary mr-2" /> Blue
                                  </SelectItem>
                                  <SelectItem value="#10B981" className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2" /> Green
                                  </SelectItem>
                                  <SelectItem value="#F97316" className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-orange-500 mr-2" /> Orange
                                  </SelectItem>
                                  <SelectItem value="#EF4444" className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2" /> Red
                                  </SelectItem>
                                  <SelectItem value="#8B5CF6" className="flex items-center">
                                    <div className="w-4 h-4 rounded-full bg-purple-500 mr-2" /> Purple
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button type="submit" disabled={createEventMutation.isPending}>
                          {createEventMutation.isPending ? "Creating..." : "Create Event"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md"
                      modifiersStyles={{
                        selected: {
                          backgroundColor: "hsl(var(--primary))"
                        }
                      }}
                      modifiers={{
                        booked: getDatesWithData()
                      }}
                      modifiersClassNames={{
                        booked: "border-primary border-[1px]"
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
              
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="events">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="tasks">Tasks</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="events" className="space-y-4">
                        {selectedDateEvents.length > 0 ? (
                          selectedDateEvents.map((event) => (
                            <div key={event.id} className="flex items-start p-4 border rounded-md">
                              <div className="w-2 h-full self-stretch rounded-full" style={{ backgroundColor: event.color || '#4F46E5' }}></div>
                              <div className="ml-4 flex-1">
                                <h3 className="font-medium text-gray-900">{event.title}</h3>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                                </p>
                                {event.location && (
                                  <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                                )}
                                {event.description && (
                                  <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            No events scheduled for this day.
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="tasks" className="space-y-4">
                        {selectedDateTasks.length > 0 ? (
                          selectedDateTasks.map((task) => (
                            <div key={task.id} className={`flex items-start p-4 border rounded-md ${task.completed ? 'bg-gray-50' : ''}`}>
                              <div className={`w-2 h-full self-stretch rounded-full ${
                                task.completed ? 'bg-green-500' : 
                                task.priority === 'high' ? 'bg-yellow-500' : 
                                task.priority === 'urgent' ? 'bg-red-500' : 
                                'bg-blue-500'
                              }`}></div>
                              <div className="ml-4 flex-1">
                                <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                )}
                                <div className="flex items-center mt-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    task.priority === 'low' ? 'bg-green-100 text-green-800' : 
                                    task.priority === 'medium' ? 'bg-blue-100 text-blue-800' : 
                                    task.priority === 'high' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                  </span>
                                  {task.subject && (
                                    <span className="inline-flex items-center ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                      {task.subject}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            No tasks due on this day.
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
