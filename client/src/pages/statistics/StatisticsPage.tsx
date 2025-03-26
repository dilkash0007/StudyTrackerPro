import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { StudySession, Task, Stats } from "@/types";
import { format, startOfWeek, startOfMonth, addDays, addMonths, subMonths, eachDayOfInterval } from "date-fns";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { BookOpen, Clock, CheckSquare, Target, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusCategory, setFocusCategory] = useState<"subject" | "time-of-day" | "productivity">("subject");
  
  // Stats data
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/study-sessions/stats"],
  });
  
  // Study sessions data
  const { data: studySessions, isLoading: sessionsLoading } = useQuery<StudySession[]>({
    queryKey: ["/api/study-sessions"],
  });
  
  // Tasks data
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  // Helper functions for date manipulation
  const getDateRange = () => {
    if (dateRange === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return {
        start,
        end: addDays(start, 6),
        label: `${format(start, 'MMM d')} - ${format(addDays(start, 6), 'MMM d, yyyy')}`
      };
    } else if (dateRange === "month") {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return {
        start,
        end,
        label: format(start, 'MMMM yyyy')
      };
    } else {
      const start = new Date(currentDate.getFullYear(), 0, 1);
      const end = new Date(currentDate.getFullYear(), 11, 31);
      return {
        start,
        end,
        label: format(start, 'yyyy')
      };
    }
  };
  
  const moveDateRangeBack = () => {
    if (dateRange === "week") {
      setCurrentDate(prevDate => addDays(prevDate, -7));
    } else if (dateRange === "month") {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear() - 1, prevDate.getMonth(), prevDate.getDate()));
    }
  };
  
  const moveDateRangeForward = () => {
    if (dateRange === "week") {
      setCurrentDate(prevDate => addDays(prevDate, 7));
    } else if (dateRange === "month") {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => new Date(prevDate.getFullYear() + 1, prevDate.getMonth(), prevDate.getDate()));
    }
  };
  
  const range = getDateRange();
  
  // Data processing functions
  const getStudyHoursByDay = () => {
    if (!studySessions || studySessions.length === 0) {
      return [];
    }
    
    const days = eachDayOfInterval({ start: range.start, end: range.end });
    
    const data = days.map(day => {
      const sessionsOnDay = studySessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return format(sessionDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });
      
      const totalHours = sessionsOnDay.reduce((sum, session) => {
        return sum + (session.duration || 0) / 60; // Convert minutes to hours
      }, 0);
      
      return {
        date: format(day, dateRange === "week" ? 'EEE' : 'MMM dd'),
        hours: parseFloat(totalHours.toFixed(1))
      };
    });
    
    return data;
  };
  
  const getStudyHoursBySubject = () => {
    if (!studySessions || studySessions.length === 0) {
      return [];
    }
    
    const sessionsInRange = studySessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= range.start && sessionDate <= range.end;
    });
    
    const subjectMap = new Map<string, number>();
    
    sessionsInRange.forEach(session => {
      const subject = session.subject || 'Unspecified';
      const hours = (session.duration || 0) / 60;
      subjectMap.set(subject, (subjectMap.get(subject) || 0) + hours);
    });
    
    return Array.from(subjectMap).map(([subject, hours]) => ({
      subject,
      hours: parseFloat(hours.toFixed(1))
    })).sort((a, b) => b.hours - a.hours);
  };
  
  const getTasksCompletionRate = () => {
    if (!tasks || tasks.length === 0) {
      return { completed: 0, incomplete: 0 };
    }
    
    const tasksInRange = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= range.start && dueDate <= range.end;
    });
    
    const completed = tasksInRange.filter(task => task.completed).length;
    const incomplete = tasksInRange.length - completed;
    
    return {
      completed,
      incomplete,
      completionRate: tasksInRange.length > 0 ? (completed / tasksInRange.length * 100).toFixed(0) : "0"
    };
  };
  
  const studyHoursByDay = getStudyHoursByDay();
  const studyHoursBySubject = getStudyHoursBySubject();
  const taskStats = getTasksCompletionRate();
  
  // Colors for charts
  const COLORS = ['#4F46E5', '#10B981', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4', '#F59E0B'];
  
  const isLoading = statsLoading || sessionsLoading || tasksLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-6">
              Statistics
            </h2>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-primary-50 text-primary">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Total Study Hours</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16 mt-1" />
                      ) : (
                        <p className="text-2xl font-semibold text-gray-900">{stats?.studyHours || "0"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-green-50 text-green-500">
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Tasks Completed</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16 mt-1" />
                      ) : (
                        <p className="text-2xl font-semibold text-gray-900">{stats?.tasksCompleted || 0}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-yellow-50 text-yellow-500">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Focus Score</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16 mt-1" />
                      ) : (
                        <p className="text-2xl font-semibold text-gray-900">{stats?.focusScore || "0%"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-md bg-red-50 text-red-500">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Current Streak</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16 mt-1" />
                      ) : (
                        <p className="text-2xl font-semibold text-gray-900">{stats?.streak || "0 days"}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Date Range Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4 items-center">
                <TabsList>
                  <TabsTrigger 
                    value="week" 
                    onClick={() => setDateRange("week")}
                    className={dateRange === "week" ? "bg-primary text-white" : ""}
                  >
                    Week
                  </TabsTrigger>
                  <TabsTrigger 
                    value="month" 
                    onClick={() => setDateRange("month")}
                    className={dateRange === "month" ? "bg-primary text-white" : ""}
                  >
                    Month
                  </TabsTrigger>
                  <TabsTrigger 
                    value="year" 
                    onClick={() => setDateRange("year")}
                    className={dateRange === "year" ? "bg-primary text-white" : ""}
                  >
                    Year
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={moveDateRangeBack}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{range.label}</span>
                  <Button variant="outline" size="icon" onClick={moveDateRangeForward}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Study Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={studyHoursByDay} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} hours`, 'Study Time']} />
                        <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Focus Distribution</CardTitle>
                    <Select value={focusCategory} onValueChange={(val: any) => setFocusCategory(val)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subject">By Subject</SelectItem>
                        <SelectItem value="time-of-day">By Time of Day</SelectItem>
                        <SelectItem value="productivity">By Productivity</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={studyHoursBySubject}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="hours"
                          nameKey="subject"
                        >
                          {studyHoursBySubject.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} hours`, 'Study Time']} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Study Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={studyHoursByDay} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} hours`, 'Study Time']} />
                        <Legend />
                        <Line type="monotone" dataKey="hours" stroke="#4F46E5" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Task Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-72 w-full" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="relative h-40 w-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Completed', value: taskStats.completed },
                                { name: 'Incomplete', value: taskStats.incomplete }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#10B981" />
                              <Cell fill="#EF4444" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-3xl font-bold">{taskStats.completionRate}%</p>
                          <p className="text-xs text-gray-500">Completion</p>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Completed</p>
                          <p className="text-xl font-medium text-green-600">{taskStats.completed}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Pending</p>
                          <p className="text-xl font-medium text-red-600">{taskStats.incomplete}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
