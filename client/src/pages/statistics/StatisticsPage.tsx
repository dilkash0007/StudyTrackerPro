import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { StudySession, Task, Stats } from "@/types";
import {
  format,
  startOfWeek,
  startOfMonth,
  addDays,
  addMonths,
  subMonths,
  eachDayOfInterval,
} from "date-fns";
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
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import {
  BookOpen,
  Clock,
  CheckSquare,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
} from "@/components/ui/NeuralDesignElements";
import { Loader2 } from "lucide-react";

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [focusCategory, setFocusCategory] = useState<
    "subject" | "time-of-day" | "productivity"
  >("subject");

  // Stats data
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/study-sessions/stats"],
  });

  // Study sessions data
  const { data: studySessions, isLoading: sessionsLoading } = useQuery<
    StudySession[]
  >({
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
        label: `${format(start, "MMM d")} - ${format(
          addDays(start, 6),
          "MMM d, yyyy"
        )}`,
      };
    } else if (dateRange === "month") {
      const start = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      return {
        start,
        end,
        label: format(start, "MMMM yyyy"),
      };
    } else {
      const start = new Date(currentDate.getFullYear(), 0, 1);
      const end = new Date(currentDate.getFullYear(), 11, 31);
      return {
        start,
        end,
        label: format(start, "yyyy"),
      };
    }
  };

  const moveDateRangeBack = () => {
    if (dateRange === "week") {
      setCurrentDate((prevDate) => addDays(prevDate, -7));
    } else if (dateRange === "month") {
      setCurrentDate((prevDate) => subMonths(prevDate, 1));
    } else {
      setCurrentDate(
        (prevDate) =>
          new Date(
            prevDate.getFullYear() - 1,
            prevDate.getMonth(),
            prevDate.getDate()
          )
      );
    }
  };

  const moveDateRangeForward = () => {
    if (dateRange === "week") {
      setCurrentDate((prevDate) => addDays(prevDate, 7));
    } else if (dateRange === "month") {
      setCurrentDate((prevDate) => addMonths(prevDate, 1));
    } else {
      setCurrentDate(
        (prevDate) =>
          new Date(
            prevDate.getFullYear() + 1,
            prevDate.getMonth(),
            prevDate.getDate()
          )
      );
    }
  };

  const range = getDateRange();

  // Data processing functions
  const getStudyHoursByDay = () => {
    if (!studySessions || studySessions.length === 0) {
      return [];
    }

    const days = eachDayOfInterval({ start: range.start, end: range.end });

    // Ensure studySessions is an array
    const sessionsArray = Array.isArray(studySessions) ? studySessions : [];

    const data = days.map((day) => {
      const sessionsOnDay = sessionsArray.filter((session) => {
        const sessionDate = new Date(session.startTime);
        return format(sessionDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
      });

      const totalHours = sessionsOnDay.reduce((sum, session) => {
        return sum + (session.duration || 0) / 60; // Convert minutes to hours
      }, 0);

      return {
        date: format(day, dateRange === "week" ? "EEE" : "MMM dd"),
        hours: parseFloat(totalHours.toFixed(1)),
      };
    });

    return data;
  };

  const getStudyHoursBySubject = () => {
    if (!studySessions || studySessions.length === 0) {
      return [];
    }

    // Ensure studySessions is an array
    const sessionsArray = Array.isArray(studySessions) ? studySessions : [];

    const sessionsInRange = sessionsArray.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= range.start && sessionDate <= range.end;
    });

    const subjectMap = new Map<string, number>();

    sessionsInRange.forEach((session) => {
      const subject = session.subject || "Unspecified";
      const hours = (session.duration || 0) / 60;
      subjectMap.set(subject, (subjectMap.get(subject) || 0) + hours);
    });

    return Array.from(subjectMap)
      .map(([subject, hours]) => ({
        subject,
        hours: parseFloat(hours.toFixed(1)),
      }))
      .sort((a, b) => b.hours - a.hours);
  };

  const getTasksCompletionRate = () => {
    if (!tasks || tasks.length === 0) {
      return { completed: 0, incomplete: 0 };
    }

    // Ensure tasks is an array
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    const tasksInRange = tasksArray.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= range.start && dueDate <= range.end;
    });

    const completed = tasksInRange.filter((task) => task.completed).length;
    const incomplete = tasksInRange.length - completed;

    return {
      completed,
      incomplete,
      completionRate:
        tasksInRange.length > 0
          ? ((completed / tasksInRange.length) * 100).toFixed(0)
          : "0",
    };
  };

  const studyHoursByDay = getStudyHoursByDay();
  const studyHoursBySubject = getStudyHoursBySubject();
  const taskStats = getTasksCompletionRate();

  // Colors for charts
  const COLORS = [
    "#4F46E5",
    "#10B981",
    "#F97316",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#F59E0B",
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NeuralBackgroundDecoration />

        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>

        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                Statistics
              </h1>
              <p className="text-gray-400">
                Track your study progress and performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Stats cards with neural styling */}
              <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                <NeuralDots
                  className="absolute top-0 right-0 w-24 h-24 opacity-10"
                  count={3}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Total Study Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-20 bg-gray-800" />
                  ) : (
                    <div className="text-2xl font-bold text-teal-400">
                      {stats?.totalHours || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                <NeuralDots
                  className="absolute top-0 right-0 w-24 h-24 opacity-10"
                  count={3}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Study Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-20 bg-gray-800" />
                  ) : (
                    <div className="text-2xl font-bold text-cyan-400">
                      {stats?.totalSessions || 0}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                <NeuralDots
                  className="absolute top-0 right-0 w-24 h-24 opacity-10"
                  count={3}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Tasks Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <Skeleton className="h-6 w-20 bg-gray-800" />
                  ) : (
                    <div className="text-2xl font-bold text-emerald-400">
                      {taskStats.completed}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                <NeuralDots
                  className="absolute top-0 right-0 w-24 h-24 opacity-10"
                  count={3}
                />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    Completion Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tasksLoading ? (
                    <Skeleton className="h-6 w-20 bg-gray-800" />
                  ) : (
                    <div className="text-2xl font-bold text-teal-400">
                      {taskStats.completionRate}%
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Tabs defaultValue="study-time" className="w-full">
                <TabsList className="mb-4 bg-gray-800/50 border border-teal-500/20">
                  <TabsTrigger
                    value="study-time"
                    className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                  >
                    Study Time
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger
                    value="subjects"
                    className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                  >
                    Subjects
                  </TabsTrigger>
                </TabsList>
                {/* Content for tabs - update with neural styled cards */}
                <TabsContent value="study-time">
                  <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                    <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                    <NeuralDots
                      className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                      count={3}
                    />

                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                          Study Hours
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={moveDateRangeBack}
                          className="h-8 w-8 border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={moveDateRangeForward}
                          className="h-8 w-8 border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Select
                          value={dateRange}
                          onValueChange={(value) =>
                            setDateRange(value as "week" | "month" | "year")
                          }
                        >
                          <SelectTrigger className="h-8 w-[90px] border-teal-500/30 bg-gray-900/30 text-gray-300">
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-teal-500/30">
                            <SelectItem value="week">Week</SelectItem>
                            <SelectItem value="month">Month</SelectItem>
                            <SelectItem value="year">Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 text-sm text-gray-400 flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>{range.label}</span>
                        </div>
                      </div>
                      {sessionsLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                        </div>
                      ) : studyHoursByDay.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-gray-400">
                          No study data for this period
                        </div>
                      ) : (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={studyHoursByDay}
                              margin={{
                                top: 20,
                                right: 30,
                                left: 0,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#2D3748"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="date"
                                stroke="#718096"
                                tick={{ fill: "#718096" }}
                              />
                              <YAxis
                                stroke="#718096"
                                tick={{ fill: "#718096" }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1A202C",
                                  borderColor: "#2D3748",
                                  color: "#E2E8F0",
                                }}
                                cursor={{ fill: "rgba(45, 55, 72, 0.2)" }}
                              />
                              <Bar
                                dataKey="hours"
                                fill="#2DD4BF"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* ... Keep remaining tabs content with same styling ... */}
                // ... existing code ...
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
