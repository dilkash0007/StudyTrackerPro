import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Edit,
  Clock,
  Award,
  Flame,
  BookOpen,
  FileText,
  Layers,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Stats, StudySession, Task, Note, FlashcardDeck } from "@/types";
import {
  format,
  startOfMonth,
  endOfMonth,
  parseISO,
  differenceInDays,
} from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";
import { useTheme } from "@/contexts/ThemeContext";

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  fullName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  profilePicture: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

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

  // Notes data
  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });

  // Flashcard decks data
  const { data: flashcardDecks, isLoading: decksLoading } = useQuery<
    FlashcardDeck[]
  >({
    queryKey: ["/api/flashcard-decks"],
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      fullName: user?.fullName || "",
      email: user?.email || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest("PUT", `/api/users/${user.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditProfileOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating profile",
        description:
          error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  // Calculate study activity
  const calculateStudyActivity = () => {
    if (!studySessions) return Array(30).fill(0);

    // Ensure studySessions is an array
    const sessionsArray = Array.isArray(studySessions) ? studySessions : [];

    const activityData = Array(30).fill(0);
    const currentDate = new Date();

    // Calculate hours studied for each of the last 30 days
    sessionsArray.forEach((session) => {
      const sessionDate = new Date(session.startTime);
      const daysDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff < 30) {
        activityData[29 - daysDiff] += (session.duration || 0) / 60; // Convert minutes to hours
      }
    });

    return activityData;
  };

  const studyActivity = calculateStudyActivity();

  // Calculate task completion rate
  const calculateTaskCompletionRate = () => {
    if (!tasks || tasks.length === 0) return 0;

    // Ensure tasks is an array
    const tasksArray = Array.isArray(tasks) ? tasks : [];

    const completedTasks = tasksArray.filter((task) => task.completed).length;
    return (completedTasks / tasksArray.length) * 100;
  };

  const taskCompletionRate = calculateTaskCompletionRate();

  // Calculate total study stats
  const calculateTotalStats = () => {
    if (!studySessions)
      return { totalHours: 0, totalSessions: 0, avgSessionLength: 0 };

    // Ensure studySessions is an array
    const sessionsArray = Array.isArray(studySessions) ? studySessions : [];

    const totalMinutes = sessionsArray.reduce(
      (total, session) => total + (session.duration || 0),
      0
    );
    const totalHours = totalMinutes / 60;
    const totalSessions = sessionsArray.length;
    const avgSessionLength =
      totalSessions > 0 ? totalMinutes / totalSessions : 0;

    return {
      totalHours: parseFloat(totalHours.toFixed(1)),
      totalSessions,
      avgSessionLength: parseFloat((avgSessionLength / 60).toFixed(1)), // Convert to hours
    };
  };

  const totalStats = calculateTotalStats();

  // Get subject distribution
  const getSubjectDistribution = () => {
    if (!studySessions || studySessions.length === 0) return [];

    // Ensure studySessions is an array
    const sessionsArray = Array.isArray(studySessions) ? studySessions : [];

    const subjectMap = new Map<string, number>();

    sessionsArray.forEach((session) => {
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

  const subjectDistribution = getSubjectDistribution();

  // Calculate most active day and time
  const getMostActiveTime = () => {
    if (!studySessions || studySessions.length === 0)
      return { day: "N/A", time: "N/A" };

    // Ensure studySessions is an array
    const sessionsArray = Array.isArray(studySessions) ? studySessions : [];

    const dayCount = new Map<number, number>();
    const hourCount = new Map<number, number>();

    sessionsArray.forEach((session) => {
      const sessionDate = new Date(session.startTime);
      const day = sessionDate.getDay();
      const hour = sessionDate.getHours();

      dayCount.set(day, (dayCount.get(day) || 0) + 1);
      hourCount.set(hour, (hourCount.get(hour) || 0) + 1);
    });

    let mostActiveDay = 0;
    let maxDayCount = 0;

    for (const [day, count] of dayCount.entries()) {
      if (count > maxDayCount) {
        mostActiveDay = day;
        maxDayCount = count;
      }
    }

    let mostActiveHour = 0;
    let maxHourCount = 0;

    for (const [hour, count] of hourCount.entries()) {
      if (count > maxHourCount) {
        mostActiveHour = hour;
        maxHourCount = count;
      }
    }

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const timeFormat =
      mostActiveHour >= 12
        ? `${mostActiveHour === 12 ? 12 : mostActiveHour - 12} PM`
        : `${mostActiveHour === 0 ? 12 : mostActiveHour} AM`;

    return {
      day: days[mostActiveDay],
      time: timeFormat,
    };
  };

  const activeTime = getMostActiveTime();

  // Loading state
  const isLoading =
    statsLoading ||
    sessionsLoading ||
    tasksLoading ||
    notesLoading ||
    decksLoading;

  // Ensure tasks is an array for use in the render section
  const tasksArray = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NeuralBackgroundDecoration />

        <div
          className={`absolute top-1/4 -right-24 w-64 h-64 ${
            isRedTheme ? "bg-rose-500/5" : "bg-cyan-500/5"
          } rounded-full blur-3xl`}
        ></div>
        <div
          className={`absolute bottom-1/4 -left-24 w-64 h-64 ${
            isRedTheme ? "bg-red-500/5" : "bg-teal-500/5"
          } rounded-full blur-3xl`}
        ></div>

        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1
                className={`text-2xl font-bold bg-gradient-to-r ${
                  isRedTheme
                    ? "from-rose-300 to-red-300"
                    : "from-teal-300 to-cyan-300"
                } text-transparent bg-clip-text`}
              >
                Profile
              </h1>
              <p className="text-gray-400">
                Manage your account and view your progress
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <Card
                className={`relative overflow-hidden backdrop-blur-sm bg-gray-900/50 ${
                  isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                } lg:col-span-1`}
              >
                <NeuralDots className="absolute top-0 right-0 w-24 h-24 opacity-10" />
                <CardHeader>
                  <CardTitle
                    className={`text-xl bg-gradient-to-r ${
                      isRedTheme
                        ? "from-rose-300 to-red-300"
                        : "from-teal-300 to-cyan-300"
                    } text-transparent bg-clip-text`}
                  >
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  {user ? (
                    <>
                      <Avatar
                        className={`h-24 w-24 border-2 ${
                          isRedTheme
                            ? "border-rose-500/30"
                            : "border-teal-500/30"
                        } mb-4`}
                      >
                        <AvatarImage src={user.profilePicture || ""} />
                        <AvatarFallback
                          className={`${
                            isRedTheme
                              ? "bg-rose-500/20 text-rose-200"
                              : "bg-teal-500/20 text-teal-200"
                          } text-xl`}
                        >
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-semibold text-gray-100 mb-1">
                        {user.fullName || user.username}
                      </h3>
                      <p className="text-gray-400 mb-4">{user.email}</p>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <Badge
                          className={`${
                            isRedTheme
                              ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30"
                              : "bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30"
                          }`}
                        >
                          Student
                        </Badge>
                        {stats?.streak && stats.streak > 0 && (
                          <Badge className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30">
                            <Flame className="h-3 w-3 mr-1" />
                            {stats.streak} Day Streak
                          </Badge>
                        )}
                      </div>
                      <Dialog
                        open={isEditProfileOpen}
                        onOpenChange={setIsEditProfileOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`${
                              isRedTheme
                                ? "border-rose-500/30 hover:bg-rose-900/20 text-rose-300"
                                : "border-teal-500/30 hover:bg-teal-900/20 text-teal-300"
                            }`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </DialogTrigger>
                        <DialogContent
                          className={`bg-gray-900 border-${
                            isRedTheme ? "rose" : "teal"
                          }-500/30`}
                        >
                          <DialogHeader>
                            <DialogTitle className="text-gray-100">
                              Edit Profile
                            </DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form
                              onSubmit={form.handleSubmit(handleSubmit)}
                              className="space-y-4"
                            >
                              <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">
                                      Username
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className={`${
                                          isRedTheme
                                            ? "border-rose-500/30 bg-gray-900/30 text-rose-100"
                                            : "border-teal-500/30 bg-gray-900/30 text-teal-100"
                                        }`}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">
                                      Full Name
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className={`${
                                          isRedTheme
                                            ? "border-rose-500/30 bg-gray-900/30 text-rose-100"
                                            : "border-teal-500/30 bg-gray-900/30 text-teal-100"
                                        }`}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">
                                      Email
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className={`${
                                          isRedTheme
                                            ? "border-rose-500/30 bg-gray-900/30 text-rose-100"
                                            : "border-teal-500/30 bg-gray-900/30 text-teal-100"
                                        }`}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="profilePicture"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">
                                      Profile Picture URL
                                    </FormLabel>
                                    <FormControl>
                                      <Input
                                        {...field}
                                        className={`${
                                          isRedTheme
                                            ? "border-rose-500/30 bg-gray-900/30 text-rose-100"
                                            : "border-teal-500/30 bg-gray-900/30 text-teal-100"
                                        }`}
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                  </FormItem>
                                )}
                              />
                            </form>
                          </Form>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditProfileOpen(false)}
                              className={`${
                                isRedTheme
                                  ? "border-rose-500/30 hover:bg-rose-900/20 text-rose-300"
                                  : "border-teal-500/30 hover:bg-teal-900/20 text-teal-300"
                              }`}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              onClick={form.handleSubmit(handleSubmit)}
                              className={`${
                                isRedTheme
                                  ? "bg-gradient-to-r from-rose-500 to-red-500 border-0 hover:from-rose-600 hover:to-red-600"
                                  : "bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                              }`}
                            >
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <div className="space-y-4 w-full">
                      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                      <Skeleton className="h-4 w-3/4 mx-auto" />
                      <Skeleton className="h-8 w-28 mx-auto rounded-md" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card
                className={`relative overflow-hidden backdrop-blur-sm bg-gray-900/50 ${
                  isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                } lg:col-span-2`}
              >
                <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                <NeuralDots
                  className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                  count={3}
                />
                <CardHeader>
                  <CardTitle
                    className={`text-xl bg-gradient-to-r ${
                      isRedTheme
                        ? "from-rose-300 to-red-300"
                        : "from-teal-300 to-cyan-300"
                    } text-transparent bg-clip-text`}
                  >
                    Study Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className="h-24 rounded-md bg-gray-800"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div
                        className={`p-4 rounded-lg bg-gray-800/30 border ${
                          isRedTheme
                            ? "border-rose-500/20"
                            : "border-teal-500/20"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock
                            className={`h-5 w-5 ${
                              isRedTheme ? "text-rose-400" : "text-teal-400"
                            }`}
                          />
                          <h3 className="text-sm font-medium text-gray-300">
                            Study Time
                          </h3>
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              isRedTheme ? "text-rose-300" : "text-teal-300"
                            }`}
                          >
                            {(stats?.totalHours || 0).toFixed(1)}h
                          </p>
                          <p className="text-xs text-gray-400">
                            Lifetime study hours
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg bg-gray-800/30 border ${
                          isRedTheme
                            ? "border-rose-500/20"
                            : "border-teal-500/20"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp
                            className={`h-5 w-5 ${
                              isRedTheme ? "text-rose-400" : "text-cyan-400"
                            }`}
                          />
                          <h3 className="text-sm font-medium text-gray-300">
                            Study Sessions
                          </h3>
                        </div>
                        <div>
                          <p
                            className={`text-2xl font-bold ${
                              isRedTheme ? "text-rose-300" : "text-cyan-300"
                            }`}
                          >
                            {stats?.totalSessions || 0}
                          </p>
                          <p className="text-xs text-gray-400">
                            Total study sessions
                          </p>
                        </div>
                      </div>

                      <div
                        className={`p-4 rounded-lg bg-gray-800/30 border ${
                          isRedTheme
                            ? "border-rose-500/20"
                            : "border-teal-500/20"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <Award className="h-5 w-5 text-amber-400" />
                          <h3 className="text-sm font-medium text-gray-300">
                            Task Completion
                          </h3>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-amber-300">
                            {taskCompletionRate.toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-400">
                            Task completion rate
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Study Activity Chart */}
              <Card
                className={`relative overflow-hidden backdrop-blur-sm bg-gray-900/50 ${
                  isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                } lg:col-span-3`}
              >
                <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                <CardHeader>
                  <CardTitle
                    className={`text-xl bg-gradient-to-r ${
                      isRedTheme
                        ? "from-rose-300 to-red-300"
                        : "from-teal-300 to-cyan-300"
                    } text-transparent bg-clip-text`}
                  >
                    Recent Study Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionsLoading ? (
                    <Skeleton className="h-40 rounded-md bg-gray-800" />
                  ) : (
                    <div className="h-40">
                      <div className="flex h-full space-x-1">
                        {studyActivity.map((hours, i) => (
                          <div key={i} className="flex-1 flex flex-col-reverse">
                            <div
                              className={`rounded-t w-full ${
                                hours > 0
                                  ? isRedTheme
                                    ? "bg-rose-500/70"
                                    : "bg-teal-500/70"
                                  : "bg-gray-800/50"
                              }`}
                              style={{
                                height: `${Math.min(
                                  Math.max((hours / 4) * 100, 5),
                                  100
                                )}%`,
                              }}
                            ></div>
                            {i % 5 === 0 && (
                              <span className="text-[9px] text-gray-400 mt-1">
                                {i === 0
                                  ? "Today"
                                  : i === 29
                                  ? "30d ago"
                                  : `${30 - i}d`}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6">
              <Tabs defaultValue="resources" className="w-full">
                <TabsList
                  className={`w-full grid grid-cols-3 sm:grid-cols-5 bg-gray-800/50 border ${
                    isRedTheme ? "border-rose-500/20" : "border-teal-500/20"
                  }`}
                >
                  <TabsTrigger
                    value="resources"
                    className={`data-[state=active]:${
                      isRedTheme
                        ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                        : "bg-teal-500/20 data-[state=active]:text-teal-300"
                    }`}
                  >
                    Resources
                  </TabsTrigger>
                  <TabsTrigger
                    value="sessions"
                    className={`data-[state=active]:${
                      isRedTheme
                        ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                        : "bg-teal-500/20 data-[state=active]:text-teal-300"
                    }`}
                  >
                    Sessions
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className={`data-[state=active]:${
                      isRedTheme
                        ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                        : "bg-teal-500/20 data-[state=active]:text-teal-300"
                    }`}
                  >
                    Tasks
                  </TabsTrigger>
                  <TabsTrigger
                    value="notes"
                    className={`data-[state=active]:${
                      isRedTheme
                        ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                        : "bg-teal-500/20 data-[state=active]:text-teal-300"
                    }`}
                  >
                    Notes
                  </TabsTrigger>
                  <TabsTrigger
                    value="flashcards"
                    className={`data-[state=active]:${
                      isRedTheme
                        ? "bg-rose-500/20 data-[state=active]:text-rose-300"
                        : "bg-teal-500/20 data-[state=active]:text-teal-300"
                    }`}
                  >
                    Flashcards
                  </TabsTrigger>
                </TabsList>

                {/* Continue with the existing TabsContent components but update their styling to match the neural theme */}
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
