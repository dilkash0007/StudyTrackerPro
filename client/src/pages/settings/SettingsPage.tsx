import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Clock,
  Moon,
  Sun,
  Shield,
  LogOut,
  Trash2,
  Save,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings } from "@/types";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const accountFormSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  currentPassword: z.string().min(1, { message: "Please enter your current password" }),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const pomodoroFormSchema = z.object({
  pomodoroFocusMinutes: z.number().min(1).max(60),
  pomodoroShortBreakMinutes: z.number().min(1).max(30),
  pomodoroLongBreakMinutes: z.number().min(1).max(60),
  pomodoroLongBreakInterval: z.number().min(1).max(10),
  dailyGoalHours: z.number().min(0.5).max(24),
  weeklyGoalHours: z.number().min(1).max(168),
});

const notificationFormSchema = z.object({
  enableEmailNotifications: z.boolean().default(true),
  emailFrequency: z.string().default("daily"),
  studyReminders: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  achievementNotifications: z.boolean().default(true),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type PomodoroFormValues = z.infer<typeof pomodoroFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState("light");
  
  // Settings data
  const { data: settings, isLoading: isLoadingSettings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });
  
  // Account form
  const accountForm = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Pomodoro form
  const pomodoroForm = useForm<PomodoroFormValues>({
    resolver: zodResolver(pomodoroFormSchema),
    defaultValues: {
      pomodoroFocusMinutes: settings?.pomodoroFocusMinutes || 25,
      pomodoroShortBreakMinutes: settings?.pomodoroShortBreakMinutes || 5,
      pomodoroLongBreakMinutes: settings?.pomodoroLongBreakMinutes || 15,
      pomodoroLongBreakInterval: settings?.pomodoroLongBreakInterval || 4,
      dailyGoalHours: settings?.dailyGoalHours || 4,
      weeklyGoalHours: settings?.weeklyGoalHours || 20,
    },
  });
  
  // Notification form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      enableEmailNotifications: settings?.notifications?.enableEmailNotifications || true,
      emailFrequency: settings?.notifications?.emailFrequency || "daily",
      studyReminders: settings?.notifications?.studyReminders || true,
      taskReminders: settings?.notifications?.taskReminders || true,
      achievementNotifications: settings?.notifications?.achievementNotifications || true,
    },
  });
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your settings have been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating settings",
        description: error.message || "An error occurred while updating your settings",
        variant: "destructive",
      });
    },
  });
  
  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async (data: AccountFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest("PUT", `/api/users/${user.id}/password`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Account updated",
        description: "Your account has been updated successfully",
      });
      accountForm.reset({
        username: user?.username || "",
        email: user?.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating account",
        description: error.message || "An error occurred while updating your account",
        variant: "destructive",
      });
    },
  });
  
  // Update pomodoro settings
  const handlePomodoroSubmit = (data: PomodoroFormValues) => {
    updateSettingsMutation.mutate(data);
  };
  
  // Update notification settings
  const handleNotificationSubmit = (data: NotificationFormValues) => {
    updateSettingsMutation.mutate({
      notifications: data,
    });
  };
  
  // Update account
  const handleAccountSubmit = (data: AccountFormValues) => {
    updateAccountMutation.mutate(data);
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    updateSettingsMutation.mutate({ theme: newTheme });
  };
  
  // Delete account
  const handleDeleteAccount = () => {
    toast({
      title: "Feature Not Implemented",
      description: "Account deletion is not implemented in this demo.",
      variant: "destructive",
    });
  };
  
  // Update form values when settings load
  React.useEffect(() => {
    if (settings) {
      pomodoroForm.reset({
        pomodoroFocusMinutes: settings.pomodoroFocusMinutes,
        pomodoroShortBreakMinutes: settings.pomodoroShortBreakMinutes,
        pomodoroLongBreakMinutes: settings.pomodoroLongBreakMinutes,
        pomodoroLongBreakInterval: settings.pomodoroLongBreakInterval,
        dailyGoalHours: settings.dailyGoalHours,
        weeklyGoalHours: settings.weeklyGoalHours,
      });
      
      if (settings.notifications) {
        notificationForm.reset({
          enableEmailNotifications: settings.notifications.enableEmailNotifications || true,
          emailFrequency: settings.notifications.emailFrequency || "daily",
          studyReminders: settings.notifications.studyReminders || true,
          taskReminders: settings.notifications.taskReminders || true,
          achievementNotifications: settings.notifications.achievementNotifications || true,
        });
      }
      
      if (settings.theme) {
        setTheme(settings.theme);
      }
    }
  }, [settings]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
              <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-4 sm:mb-0">
                Settings
              </h2>
            </div>
            
            <Tabs defaultValue="account" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="pomodoro">
                  <Clock className="h-4 w-4 mr-2" />
                  Pomodoro & Goals
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="appearance">
                  <Sun className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account information and security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...accountForm}>
                      <form onSubmit={accountForm.handleSubmit(handleAccountSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Profile Information</h3>
                          
                          <FormField
                            control={accountForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={accountForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Change Password</h3>
                          
                          <FormField
                            control={accountForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={accountForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Leave blank if you don't want to change your password
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={accountForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={updateAccountMutation.isPending}>
                          {updateAccountMutation.isPending ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Actions</h3>
                      
                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          className="justify-start" 
                          onClick={() => logout()}
                        >
                          <LogOut className="mr-2 h-4 w-4 text-red-500" />
                          <span className="text-red-500">Log Out</span>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="justify-start" 
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                              <span className="text-red-500">Delete Account</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove all of your data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pomodoro">
                <Card>
                  <CardHeader>
                    <CardTitle>Pomodoro Timer & Study Goals</CardTitle>
                    <CardDescription>
                      Customize your Pomodoro timer settings and set your study goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...pomodoroForm}>
                      <form onSubmit={pomodoroForm.handleSubmit(handlePomodoroSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Pomodoro Timer</h3>
                          
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroFocusMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Focus Time (minutes)</FormLabel>
                                <div className="flex items-center space-x-4">
                                  <FormControl>
                                    <Slider
                                      min={1}
                                      max={60}
                                      step={1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                      className="flex-1"
                                    />
                                  </FormControl>
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroShortBreakMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Short Break (minutes)</FormLabel>
                                <div className="flex items-center space-x-4">
                                  <FormControl>
                                    <Slider
                                      min={1}
                                      max={30}
                                      step={1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                      className="flex-1"
                                    />
                                  </FormControl>
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroLongBreakMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Long Break (minutes)</FormLabel>
                                <div className="flex items-center space-x-4">
                                  <FormControl>
                                    <Slider
                                      min={5}
                                      max={60}
                                      step={1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                      className="flex-1"
                                    />
                                  </FormControl>
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroLongBreakInterval"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Long Break Interval</FormLabel>
                                <div className="flex items-center space-x-4">
                                  <FormControl>
                                    <Slider
                                      min={1}
                                      max={10}
                                      step={1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                      className="flex-1"
                                    />
                                  </FormControl>
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                                <FormDescription>
                                  Number of focus sessions before a long break
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Study Goals</h3>
                          
                          <FormField
                            control={pomodoroForm.control}
                            name="dailyGoalHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Daily Study Goal (hours)</FormLabel>
                                <div className="flex items-center space-x-4">
                                  <FormControl>
                                    <Slider
                                      min={0.5}
                                      max={12}
                                      step={0.5}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                      className="flex-1"
                                    />
                                  </FormControl>
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={pomodoroForm.control}
                            name="weeklyGoalHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Weekly Study Goal (hours)</FormLabel>
                                <div className="flex items-center space-x-4">
                                  <FormControl>
                                    <Slider
                                      min={1}
                                      max={40}
                                      step={1}
                                      value={[field.value]}
                                      onValueChange={(value) => field.onChange(value[0])}
                                      className="flex-1"
                                    />
                                  </FormControl>
                                  <span className="w-12 text-center">{field.value}</span>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={updateSettingsMutation.isPending}>
                          {updateSettingsMutation.isPending ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Email Notifications</h3>
                          
                          <FormField
                            control={notificationForm.control}
                            name="enableEmailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Email Notifications</FormLabel>
                                  <FormDescription>
                                    Receive study progress and updates via email
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="emailFrequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Frequency</FormLabel>
                                <Select 
                                  value={field.value} 
                                  onValueChange={field.onChange}
                                  disabled={!notificationForm.watch("enableEmailNotifications")}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily Digest</SelectItem>
                                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                                    <SelectItem value="important">Important Updates Only</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Study Notifications</h3>
                          
                          <FormField
                            control={notificationForm.control}
                            name="studyReminders"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Study Session Reminders</FormLabel>
                                  <FormDescription>
                                    Get reminders for your scheduled study sessions
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="taskReminders"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Task Due Reminders</FormLabel>
                                  <FormDescription>
                                    Get reminders for upcoming task deadlines
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={notificationForm.control}
                            name="achievementNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Achievement Notifications</FormLabel>
                                  <FormDescription>
                                    Get notified when you earn achievements
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Button type="submit" disabled={updateSettingsMutation.isPending}>
                          {updateSettingsMutation.isPending ? (
                            <>Saving...</>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize the look and feel of your application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Theme</h3>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Dark Mode</Label>
                          <p className="text-sm text-gray-500">
                            Toggle between light and dark mode
                          </p>
                        </div>
                        <Switch
                          checked={theme === "dark"}
                          onCheckedChange={toggleTheme}
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Accessibility</h3>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">Reduce Animations</Label>
                          <p className="text-sm text-gray-500">
                            Minimize motion for accessibility purposes
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label className="text-base">High Contrast</Label>
                          <p className="text-sm text-gray-500">
                            Increase contrast for better visibility
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Font Size</h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Font Size</Label>
                          <span className="text-sm font-medium">Medium</span>
                        </div>
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          defaultValue={[3]}
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Small</span>
                          <span>Large</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
