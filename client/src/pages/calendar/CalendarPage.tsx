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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Event, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isSameDay } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
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
        description:
          error.message || "An error occurred while creating the event",
        variant: "destructive",
      });
    },
  });

  // Filter events for selected date
  const getEventsForSelectedDate = () => {
    if (!selectedDate || !events) return [];

    // Ensure events is an array before calling filter
    const eventsArray = Array.isArray(events) ? events : [];

    return eventsArray
      .filter((event) => isSameDay(new Date(event.startTime), selectedDate))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  };

  // Filter tasks for selected date
  const getTasksForSelectedDate = () => {
    if (!selectedDate || !tasks) return [];

    // Ensure tasks is an array before calling filter
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    return tasksArray
      .filter(
        (task) =>
          task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)
      )
      .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
  };

  const selectedDateEvents = getEventsForSelectedDate();
  const selectedDateTasks = getTasksForSelectedDate();

  // Calculate dates with events for the calendar
  const getDatesWithData = () => {
    if (!events && !tasks) return [];

    const dates = new Set<string>();

    // Ensure events is an array before calling forEach
    if (events) {
      const eventsArray = Array.isArray(events) ? events : [];
      eventsArray.forEach((event) => {
        dates.add(format(new Date(event.startTime), "yyyy-MM-dd"));
      });
    }

    // Ensure tasks is an array before calling forEach
    if (tasks) {
      const tasksArray = Array.isArray(tasks) ? tasks : [];
      tasksArray.forEach((task) => {
        if (task.dueDate) {
          dates.add(format(new Date(task.dueDate), "yyyy-MM-dd"));
        }
      });
    }

    return Array.from(dates).map((dateStr) => new Date(dateStr));
  };

  const handleSubmit = (data: EventFormValues) => {
    createEventMutation.mutate(data);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NeuralBackgroundDecoration />

        <div
          className={`absolute top-1/4 -right-10 md:-right-24 w-48 md:w-64 h-48 md:h-64 ${
            isRedTheme ? "bg-rose-500/5" : "bg-cyan-500/5"
          } rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute bottom-1/4 -left-10 md:-left-24 w-48 md:w-64 h-48 md:h-64 ${
            isRedTheme ? "bg-red-500/5" : "bg-teal-500/5"
          } rounded-full blur-3xl`}
        ></div>

        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 z-10">
          <div className="w-full max-w-7xl mx-auto">
            <div className="flex flex-col mb-4 md:mb-6">
              <h1
                className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${
                  isRedTheme
                    ? "from-rose-300 to-red-300"
                    : "from-teal-300 to-cyan-300"
                } text-transparent bg-clip-text`}
              >
                Calendar
              </h1>
              <p className="text-sm sm:text-base text-gray-400">
                Manage your schedule and upcoming events
              </p>
            </div>

            <div className="flex justify-between items-center mb-4 md:mb-6">
              <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                <DialogTrigger asChild>
                  <Button
                    className={`text-sm sm:text-base bg-gradient-to-r ${
                      isRedTheme
                        ? "from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
                        : "from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    } border-0`}
                  >
                    <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className={`bg-gray-900/90 backdrop-blur-md max-w-[90%] sm:max-w-md md:max-w-lg ${
                    isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                  }`}
                >
                  <DialogHeader>
                    <DialogTitle className="text-gray-100">
                      Add New Event
                    </DialogTitle>
                  </DialogHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleSubmit)}
                      className="space-y-3 sm:space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className={`border-teal-500/30 bg-gray-900/30 text-gray-100 ${
                                  isRedTheme ? "border-rose-500/30" : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                className={`border-teal-500/30 bg-gray-900/30 text-gray-100 ${
                                  isRedTheme ? "border-rose-500/30" : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Start Time
                              </FormLabel>
                              <FormControl>
                                <input
                                  type="datetime-local"
                                  value={format(
                                    field.value,
                                    "yyyy-MM-dd'T'HH:mm"
                                  )}
                                  onChange={(e) =>
                                    field.onChange(new Date(e.target.value))
                                  }
                                  className={`flex h-10 w-full rounded-md border border-teal-500/30 bg-gray-900/30 text-gray-100 px-3 py-2 text-sm ${
                                    isRedTheme ? "border-rose-500/30" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                End Time
                              </FormLabel>
                              <FormControl>
                                <input
                                  type="datetime-local"
                                  value={format(
                                    field.value,
                                    "yyyy-MM-dd'T'HH:mm"
                                  )}
                                  onChange={(e) =>
                                    field.onChange(new Date(e.target.value))
                                  }
                                  className={`flex h-10 w-full rounded-md border border-teal-500/30 bg-gray-900/30 text-gray-100 px-3 py-2 text-sm ${
                                    isRedTheme ? "border-rose-500/30" : ""
                                  }`}
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Location
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className={`border-teal-500/30 bg-gray-900/30 text-gray-100 ${
                                  isRedTheme ? "border-rose-500/30" : ""
                                }`}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Color
                            </FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                {[
                                  "#4F46E5",
                                  "#10B981",
                                  "#F97316",
                                  "#EF4444",
                                  "#8B5CF6",
                                  "#06B6D4",
                                  "#F59E0B",
                                ].map((color) => (
                                  <div
                                    key={color}
                                    className={`w-8 h-8 rounded-full cursor-pointer ${
                                      field.value === color
                                        ? `ring-2 ring-offset-2 ring-teal-500 ring-offset-gray-900 ${
                                            isRedTheme ? "ring-rose-500" : ""
                                          }`
                                        : ""
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => field.onChange(color)}
                                  />
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddEventOpen(false)}
                      className={`w-full sm:w-auto ${
                        isRedTheme
                          ? "border-rose-500/30 hover:bg-rose-900/20"
                          : "border-teal-500/30 hover:bg-teal-900/20"
                      } text-gray-300`}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      onClick={form.handleSubmit(handleSubmit)}
                      className={`w-full sm:w-auto bg-gradient-to-r ${
                        isRedTheme
                          ? "from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
                          : "from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                      } border-0`}
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending && (
                        <div className="mr-2 h-4 w-4 animate-spin">⏳</div>
                      )}
                      Add Event
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <Card
                className={`relative overflow-hidden backdrop-blur-md bg-gray-900/50 ${
                  isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                }`}
              >
                <NeuralDots className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 opacity-10" />
                <NeuralDots
                  className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 opacity-5"
                  count={3}
                />

                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle
                    className={`text-lg sm:text-xl bg-gradient-to-r ${
                      isRedTheme
                        ? "from-rose-300 to-red-300"
                        : "from-teal-300 to-cyan-300"
                    } text-transparent bg-clip-text`}
                  >
                    Monthly Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className={`w-full rounded-md border-0 bg-gray-900/70 backdrop-blur-md text-gray-100`}
                    classNames={{
                      months: "w-full flex flex-col space-y-4",
                      month: "w-full space-y-4",
                      head_cell:
                        "text-gray-300 font-normal text-[0.7rem] sm:text-[0.8rem]",
                      day: `text-sm text-gray-100 h-7 w-7 sm:h-9 sm:w-9 hover:bg-${
                        isRedTheme ? "rose" : "teal"
                      }-900/20`,
                      day_selected: isRedTheme
                        ? "bg-rose-500 text-gray-900 hover:bg-rose-600"
                        : "bg-teal-500 text-gray-900 hover:bg-teal-600",
                      day_today: isRedTheme
                        ? "bg-rose-500/20 text-rose-300 font-medium"
                        : "bg-teal-500/20 text-teal-300 font-medium",
                      caption_label:
                        "text-gray-100 font-medium text-sm sm:text-base",
                      nav_button: `h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-70 hover:opacity-100 border-${
                        isRedTheme ? "rose" : "teal"
                      }-500/30 text-gray-100`,
                      caption: "relative flex justify-center pt-1 items-center",
                      table: "w-full border-collapse",
                      cell: "p-0 relative",
                      row: "flex w-full mt-1 sm:mt-2",
                    }}
                    components={{
                      DayContent: (props) => {
                        const date = format(props.date, "yyyy-MM-dd");
                        const hasData = getDatesWithData().some(
                          (d) => format(d, "yyyy-MM-dd") === date
                        );

                        return (
                          <div className="flex items-center justify-center w-full h-full relative">
                            <span className="text-xs sm:text-sm">
                              {props.date.getDate()}
                            </span>
                            {hasData && (
                              <div
                                className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                                  isRedTheme ? "bg-rose-400" : "bg-teal-400"
                                }`}
                              />
                            )}
                          </div>
                        );
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card
                className={`relative overflow-hidden backdrop-blur-md bg-gray-900/50 ${
                  isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                }`}
              >
                <NeuralDots className="absolute top-0 right-0 w-24 h-24 opacity-10" />

                <CardHeader className="p-3 sm:p-4 md:p-6">
                  <CardTitle
                    className={`text-lg sm:text-xl bg-gradient-to-r ${
                      isRedTheme
                        ? "from-rose-300 to-red-300"
                        : "from-teal-300 to-cyan-300"
                    } text-transparent bg-clip-text`}
                  >
                    {selectedDate
                      ? format(selectedDate, "MMMM d, yyyy")
                      : "Select a date"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
                  <Tabs defaultValue="events" className="space-y-4">
                    <TabsList
                      className={`grid w-full grid-cols-2 bg-gray-800/70 backdrop-blur-sm border ${
                        isRedTheme ? "border-rose-500/20" : "border-teal-500/20"
                      }`}
                    >
                      <TabsTrigger
                        value="events"
                        className={`text-sm sm:text-base data-[state=active]:${
                          isRedTheme
                            ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                            : "bg-teal-500/20 data-[state=active]:text-teal-300"
                        }`}
                      >
                        Events
                      </TabsTrigger>
                      <TabsTrigger
                        value="tasks"
                        className={`text-sm sm:text-base data-[state=active]:${
                          isRedTheme
                            ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                            : "bg-teal-500/20 data-[state=active]:text-teal-300"
                        }`}
                      >
                        Tasks
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="events"
                      className="space-y-3 sm:space-y-4"
                    >
                      {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-4 sm:py-6 text-gray-400 text-sm sm:text-base backdrop-blur-sm bg-gray-800/10 rounded-lg">
                          No events for this date
                        </div>
                      ) : (
                        selectedDateEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`p-3 rounded-lg border backdrop-blur-sm ${
                              isRedTheme
                                ? "border-rose-500/20"
                                : "border-teal-500/20"
                            } bg-gray-800/30`}
                          >
                            <div className="flex items-start">
                              <div
                                className="w-2 h-2 mt-1.5 rounded-full mr-2 flex-shrink-0"
                                style={{ backgroundColor: event.color }}
                              ></div>
                              <div className="flex-1">
                                <h4 className="text-gray-100 font-medium text-sm sm:text-base">
                                  {event.title}
                                </h4>
                                {event.description && (
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex items-center mt-2 text-xs text-gray-400">
                                  <CalendarIcon className="h-3 w-3 mr-1" />
                                  <span>
                                    {format(
                                      new Date(event.startTime),
                                      "h:mm a"
                                    )}{" "}
                                    -{format(new Date(event.endTime), "h:mm a")}
                                  </span>
                                </div>
                                {event.location && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    📍 {event.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent
                      value="tasks"
                      className="space-y-3 sm:space-y-4"
                    >
                      {selectedDateTasks.length === 0 ? (
                        <div className="text-center py-4 sm:py-6 text-gray-400 text-sm sm:text-base backdrop-blur-sm bg-gray-800/10 rounded-lg">
                          No tasks due on this date
                        </div>
                      ) : (
                        selectedDateTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`p-3 rounded-lg border backdrop-blur-sm ${
                              isRedTheme
                                ? "border-rose-500/20"
                                : "border-teal-500/20"
                            } bg-gray-800/30`}
                          >
                            <div className="flex items-start">
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mr-2 ${
                                  task.completed
                                    ? isRedTheme
                                      ? "bg-rose-500/20 border-rose-500"
                                      : "bg-teal-500/20 border-teal-500"
                                    : "border-gray-500"
                                }`}
                              >
                                {task.completed && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={`h-3 w-3 ${
                                      isRedTheme
                                        ? "text-rose-400"
                                        : "text-teal-400"
                                    }`}
                                  >
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4
                                  className={`font-medium text-sm sm:text-base ${
                                    task.completed
                                      ? "text-gray-400 line-through"
                                      : "text-gray-100"
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                                    {task.description}
                                  </p>
                                )}
                                {task.priority && (
                                  <div
                                    className={`inline-block px-2 py-0.5 text-xs rounded mt-2 ${
                                      task.priority === "high"
                                        ? "bg-red-500/20 text-red-300"
                                        : task.priority === "medium"
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : "bg-blue-500/20 text-blue-300"
                                    }`}
                                  >
                                    {task.priority.charAt(0).toUpperCase() +
                                      task.priority.slice(1)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
