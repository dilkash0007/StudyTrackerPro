import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  DialogTrigger 
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
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Stats, StudySession, Task, Note, FlashcardDeck } from "@/types";
import { format, startOfMonth, endOfMonth, parseISO, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
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
  
  // Notes data
  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
  });
  
  // Flashcard decks data
  const { data: flashcardDecks, isLoading: decksLoading } = useQuery<FlashcardDeck[]>({
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
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };
  
  // Calculate study activity
  const calculateStudyActivity = () => {
    if (!studySessions || studySessions.length === 0) {
      return Array(30).fill(0);
    }
    
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
    
    const activityData = Array(daysInMonth).fill(0);
    
    studySessions.forEach(session => {
      const sessionDate = new Date(session.startTime);
      if (sessionDate >= monthStart && sessionDate <= monthEnd) {
        const dayOfMonth = sessionDate.getDate() - 1;
        activityData[dayOfMonth] += (session.duration || 0) / 60; // Convert minutes to hours
      }
    });
    
    return activityData;
  };
  
  const studyActivity = calculateStudyActivity();
  
  // Calculate task completion rate
  const calculateTaskCompletionRate = () => {
    if (!tasks || tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    return (completedTasks / tasks.length) * 100;
  };
  
  const taskCompletionRate = calculateTaskCompletionRate();
  
  // Calculate total study stats
  const calculateTotalStats = () => {
    if (!studySessions) return { totalHours: 0, totalSessions: 0, avgSessionLength: 0 };
    
    const totalMinutes = studySessions.reduce((total, session) => total + (session.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const totalSessions = studySessions.length;
    const avgSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    
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
    
    const subjectMap = new Map<string, number>();
    
    studySessions.forEach(session => {
      const subject = session.subject || 'Unspecified';
      const hours = (session.duration || 0) / 60;
      subjectMap.set(subject, (subjectMap.get(subject) || 0) + hours);
    });
    
    return Array.from(subjectMap).map(([subject, hours]) => ({
      subject,
      hours: parseFloat(hours.toFixed(1))
    })).sort((a, b) => b.hours - a.hours);
  };
  
  const subjectDistribution = getSubjectDistribution();
  
  // Calculate most active day and time
  const getMostActiveTime = () => {
    if (!studySessions || studySessions.length === 0) return { day: "N/A", time: "N/A" };
    
    const dayCount = new Map<number, number>();
    const hourCount = new Map<number, number>();
    
    studySessions.forEach(session => {
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
    
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeFormat = mostActiveHour >= 12 
      ? `${mostActiveHour === 12 ? 12 : mostActiveHour - 12} PM` 
      : `${mostActiveHour === 0 ? 12 : mostActiveHour} AM`;
    
    return {
      day: days[mostActiveDay],
      time: timeFormat
    };
  };
  
  const activeTime = getMostActiveTime();
  
  // Loading state
  const isLoading = statsLoading || sessionsLoading || tasksLoading || notesLoading || decksLoading;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
              <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-4 sm:mb-0">
                My Profile
              </h2>
              
              <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="profilePicture"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Picture URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter profile picture URL" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsEditProfileOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={updateProfileMutation.isPending}>
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="md:col-span-1">
                <CardContent className="pt-6 flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    {user?.profilePicture ? (
                      <AvatarImage src={user.profilePicture} />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-bold mb-1">{user?.fullName || user?.username || "User"}</h3>
                  <p className="text-gray-500 mb-4">@{user?.username || "username"}</p>
                  
                  <div className="flex space-x-2 mb-6">
                    <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                      Student
                    </Badge>
                    {stats?.streak && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        {stats.streak} Streak
                      </Badge>
                    )}
                  </div>
                  
                  <div className="w-full space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Focus Score</span>
                        <span className="text-sm font-medium">{stats?.focusScore || "0%"}</span>
                      </div>
                      <Progress value={parseInt((stats?.focusScore || "0%").replace("%", ""))} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Task Completion</span>
                        <span className="text-sm font-medium">{taskCompletionRate.toFixed(0)}%</span>
                      </div>
                      <Progress value={taskCompletionRate} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Study Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">Total Hours</span>
                      </div>
                      <p className="text-2xl font-bold">{totalStats.totalHours}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Calendar className="h-5 w-5 text-green-500 mr-2" />
                        <span className="font-medium">Sessions</span>
                      </div>
                      <p className="text-2xl font-bold">{totalStats.totalSessions}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Award className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="font-medium">Avg. Session</span>
                      </div>
                      <p className="text-2xl font-bold">{totalStats.avgSessionLength}h</p>
                    </div>
                  </div>
                  
                  <h4 className="font-medium mb-3">Monthly Activity</h4>
                  <div className="h-24 flex items-end space-x-1">
                    {studyActivity.map((hours, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className={`w-full ${hours > 0 ? 'bg-primary' : 'bg-gray-200'} rounded-sm`} 
                          style={{ height: `${Math.min(100, (hours / 5) * 100)}%` }}
                        ></div>
                        {index % 5 === 0 && (
                          <span className="text-xs text-gray-500 mt-1">{index + 1}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="stats" className="space-y-6">
              <TabsList>
                <TabsTrigger value="stats">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="subjects">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Subjects
                </TabsTrigger>
                <TabsTrigger value="content">
                  <FileText className="h-4 w-4 mr-2" />
                  My Content
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Study Habits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">Most Active Day</span>
                          <span className="text-sm font-medium">{activeTime.day}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-500">Most Active Time</span>
                          <span className="text-sm font-medium">{activeTime.time}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">Focus Distribution</h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Morning</span>
                              <span className="text-xs">28%</span>
                            </div>
                            <Progress value={28} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Afternoon</span>
                              <span className="text-xs">45%</span>
                            </div>
                            <Progress value={45} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-xs">Evening</span>
                              <span className="text-xs">27%</span>
                            </div>
                            <Progress value={27} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      ) : (
                        <>
                          <div className="mb-6">
                            <div className="text-center mb-4">
                              <span className="text-3xl font-bold">{tasks ? tasks.filter(task => task.completed).length : 0}</span>
                              <span className="text-gray-500 ml-2">of</span>
                              <span className="ml-2">{tasks?.length || 0}</span>
                            </div>
                            <Progress value={taskCompletionRate} className="h-3" />
                            <p className="text-sm text-center mt-2">Tasks Completed</p>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">High Priority</span>
                              <span className="text-sm font-medium">
                                {tasks ? tasks.filter(task => task.priority === "high" && task.completed).length : 0} / 
                                {tasks ? tasks.filter(task => task.priority === "high").length : 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Medium Priority</span>
                              <span className="text-sm font-medium">
                                {tasks ? tasks.filter(task => task.priority === "medium" && task.completed).length : 0} / 
                                {tasks ? tasks.filter(task => task.priority === "medium").length : 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Low Priority</span>
                              <span className="text-sm font-medium">
                                {tasks ? tasks.filter(task => task.priority === "low" && task.completed).length : 0} / 
                                {tasks ? tasks.filter(task => task.priority === "low").length : 0}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Achievements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-primary-50 text-primary flex items-center justify-center mb-2">
                            <Flame className="h-6 w-6" />
                          </div>
                          <span className="text-xs text-center">7-Day Streak</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center mb-2">
                            <Clock className="h-6 w-6" />
                          </div>
                          <span className="text-xs text-center">10h Study</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-2">
                            <Award className="h-6 w-6" />
                          </div>
                          <span className="text-xs text-center">Top 10%</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center mb-2">
                            <TrendingUp className="h-6 w-6" />
                          </div>
                          <span className="text-xs text-center">Progress</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                            <Layers className="h-6 w-6" />
                          </div>
                          <span className="text-xs text-center">50 Cards</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
                            <BookOpen className="h-6 w-6" />
                          </div>
                          <span className="text-xs text-center">Bookworm</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="subjects">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : (
                      <>
                        {subjectDistribution.length > 0 ? (
                          <div className="space-y-4">
                            {subjectDistribution.map((item, index) => (
                              <div key={index}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{item.subject}</span>
                                  <span className="text-sm font-medium">{item.hours}h</span>
                                </div>
                                <Progress value={(item.hours / totalStats.totalHours) * 100} className="h-2" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            No study sessions recorded yet. Start studying to see your subject distribution!
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : (
                        <>
                          {notes && notes.length > 0 ? (
                            <ul className="space-y-2">
                              {notes.slice(0, 5).map((note) => (
                                <li key={note.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                  <div>
                                    <p className="font-medium">{note.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {note.subject && <Badge variant="outline" className="mr-2">{note.subject}</Badge>}
                                      {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="sm">View</Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              You haven't created any notes yet.
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full">View All Notes</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>My Flashcard Decks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-8 w-full" />
                        </div>
                      ) : (
                        <>
                          {flashcardDecks && flashcardDecks.length > 0 ? (
                            <ul className="space-y-2">
                              {flashcardDecks.slice(0, 5).map((deck) => (
                                <li key={deck.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md">
                                  <div>
                                    <p className="font-medium">{deck.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {deck.subject && <Badge variant="outline" className="mr-2">{deck.subject}</Badge>}
                                      Created {format(new Date(deck.createdAt), 'MMM d, yyyy')}
                                    </p>
                                  </div>
                                  <Button variant="ghost" size="sm">Study</Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              You haven't created any flashcard decks yet.
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                    <CardFooter className="border-t pt-4">
                      <Button variant="outline" className="w-full">View All Decks</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
