import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Form,
  FormControl,
  FormDescription,
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
import { useTheme, ThemeType } from "@/contexts/ThemeContext";

const accountFormSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    currentPassword: z
      .string()
      .min(1, { message: "Please enter your current password" }),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }
  );

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

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "neural-default", "neural-red"], {
    required_error: "Please select a theme.",
  }),
  fontSize: z.enum(["small", "medium", "large"], {
    required_error: "Please select a font size.",
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type PomodoroFormValues = z.infer<typeof pomodoroFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

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
      enableEmailNotifications:
        settings?.notifications?.enableEmailNotifications || true,
      emailFrequency: settings?.notifications?.emailFrequency || "daily",
      studyReminders: settings?.notifications?.studyReminders || true,
      taskReminders: settings?.notifications?.taskReminders || true,
      achievementNotifications:
        settings?.notifications?.achievementNotifications || true,
    },
  });

  // Appearance form
  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: theme as ThemeType,
      fontSize: "medium",
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
        description:
          error.message || "An error occurred while updating your settings",
        variant: "destructive",
      });
    },
  });

  // Update account mutation
  const updateAccountMutation = useMutation({
    mutationFn: async (data: AccountFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const res = await apiRequest(
        "PUT",
        `/api/users/${user.id}/password`,
        data
      );
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
        description:
          error.message || "An error occurred while updating your account",
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

  // Update appearance settings
  function onAppearanceSubmit(data: z.infer<typeof appearanceFormSchema>) {
    setTheme(data.theme as ThemeType);
    toast({
      title: "Appearance settings updated",
      description: "Your appearance settings have been updated.",
    });
  }

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
          enableEmailNotifications:
            settings.notifications.enableEmailNotifications || true,
          emailFrequency: settings.notifications.emailFrequency || "daily",
          studyReminders: settings.notifications.studyReminders || true,
          taskReminders: settings.notifications.taskReminders || true,
          achievementNotifications:
            settings.notifications.achievementNotifications || true,
        });
      }

      if (settings.theme) {
        setTheme(settings.theme);
      }
    }
  }, [settings]);

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
                Settings
              </h1>
              <p className="text-gray-400">
                Manage your account and application preferences
              </p>
            </div>

            <Tabs defaultValue="account" className="w-full">
              <TabsList className="mb-6 bg-gray-800/50 border border-teal-500/20">
                <TabsTrigger
                  value="account"
                  className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                >
                  <User className="w-4 h-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="pomodoro"
                  className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Pomodoro
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-teal-500/20 data-[state=active]:text-teal-300"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                  <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                  <NeuralDots
                    className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                    count={3}
                  />

                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                      Account Information
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your account information and change your password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...accountForm}>
                      <form
                        onSubmit={accountForm.handleSubmit(handleAccountSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={accountForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Username
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  disabled
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={accountForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  disabled
                                />
                              </FormControl>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <Separator className="bg-teal-500/20" />
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-300">
                            Change Password
                          </h3>
                          <FormField
                            control={accountForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Current Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  New Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={accountForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Confirm New Password
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="password"
                                    {...field}
                                    className="border-teal-500/30 bg-gray-900/30 text-gray-100"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                            disabled={updateAccountMutation.isPending}
                          >
                            {updateAccountMutation.isPending && (
                              <span className="mr-2 h-4 w-4 animate-spin">
                                ⏳
                              </span>
                            )}
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                    <NeuralDots
                      className="absolute top-0 right-0 w-24 h-24 opacity-10"
                      count={3}
                    />
                    <CardHeader>
                      <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                        Sign Out
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Sign out of your account on this device
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={logout}
                        variant="outline"
                        className="w-full border-teal-500/30 hover:bg-red-900/20 text-gray-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                    <NeuralDots
                      className="absolute top-0 right-0 w-24 h-24 opacity-10"
                      count={3}
                    />
                    <CardHeader>
                      <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-red-300 text-transparent bg-clip-text">
                        Delete Account
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Permanently delete your account and all your data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            className="w-full bg-red-900/30 border-red-500/30 hover:bg-red-900/50 text-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-teal-500/30">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-gray-100">
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              This action cannot be undone. This will
                              permanently delete your account and remove your
                              data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-teal-500/30 hover:bg-gray-800 text-gray-300">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-900/50 border-red-500/30 hover:bg-red-900/70 text-red-300"
                              onClick={handleDeleteAccount}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="pomodoro">
                <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                  <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                  <NeuralDots
                    className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                    count={3}
                  />

                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                      Pomodoro Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Customize your pomodoro timer and study goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...pomodoroForm}>
                      <form
                        onSubmit={pomodoroForm.handleSubmit(
                          handlePomodoroSubmit
                        )}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroFocusMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Focus Time (minutes)
                                </FormLabel>
                                <FormControl>
                                  <Slider
                                    min={1}
                                    max={60}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroShortBreakMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Short Break (minutes)
                                </FormLabel>
                                <FormControl>
                                  <Slider
                                    min={1}
                                    max={30}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroLongBreakMinutes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Long Break (minutes)
                                </FormLabel>
                                <FormControl>
                                  <Slider
                                    min={5}
                                    max={60}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pomodoroForm.control}
                            name="pomodoroLongBreakInterval"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Long Break Interval
                                </FormLabel>
                                <FormControl>
                                  <Slider
                                    min={1}
                                    max={10}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400">
                                  Number of focus sessions before a long break
                                </FormDescription>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pomodoroForm.control}
                            name="dailyGoalHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Daily Study Goal (hours)
                                </FormLabel>
                                <FormControl>
                                  <Slider
                                    min={0.5}
                                    max={12}
                                    step={0.5}
                                    value={[field.value]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pomodoroForm.control}
                            name="weeklyGoalHours"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  Weekly Study Goal (hours)
                                </FormLabel>
                                <FormControl>
                                  <Slider
                                    min={1}
                                    max={40}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) =>
                                      field.onChange(value[0])
                                    }
                                    className="flex-1"
                                  />
                                </FormControl>
                                <FormMessage className="text-red-400" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                            disabled={updateSettingsMutation.isPending}
                          >
                            {updateSettingsMutation.isPending && (
                              <span className="mr-2 h-4 w-4 animate-spin">
                                ⏳
                              </span>
                            )}
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                  <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                  <NeuralDots
                    className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                    count={3}
                  />

                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                      Notification Preferences
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form
                        onSubmit={notificationForm.handleSubmit(
                          handleNotificationSubmit
                        )}
                        className="space-y-6"
                      >
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-300">
                            Email Notifications
                          </h3>

                          <FormField
                            control={notificationForm.control}
                            name="enableEmailNotifications"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base text-gray-300">
                                    Email Notifications
                                  </FormLabel>
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
                                  disabled={
                                    !notificationForm.watch(
                                      "enableEmailNotifications"
                                    )
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">
                                      Daily Digest
                                    </SelectItem>
                                    <SelectItem value="weekly">
                                      Weekly Summary
                                    </SelectItem>
                                    <SelectItem value="important">
                                      Important Updates Only
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium text-gray-300">
                            Study Notifications
                          </h3>

                          <FormField
                            control={notificationForm.control}
                            name="studyReminders"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base text-gray-300">
                                    Study Session Reminders
                                  </FormLabel>
                                  <FormDescription>
                                    Get reminders for your scheduled study
                                    sessions
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
                                  <FormLabel className="text-base text-gray-300">
                                    Task Due Reminders
                                  </FormLabel>
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
                                  <FormLabel className="text-base text-gray-300">
                                    Achievement Notifications
                                  </FormLabel>
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

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                            disabled={updateSettingsMutation.isPending}
                          >
                            {updateSettingsMutation.isPending && (
                              <span className="mr-2 h-4 w-4 animate-spin">
                                ⏳
                              </span>
                            )}
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance">
                <NeuralCard>
                  <NeuralCardHeader>
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                      Appearance Settings
                    </h3>
                    <p className="text-sm text-gray-400">
                      Customize how the application looks
                    </p>
                  </NeuralCardHeader>
                  <Form {...appearanceForm}>
                    <form
                      onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)}
                    >
                      <CardContent className="space-y-4">
                        <FormField
                          control={appearanceForm.control}
                          name="theme"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Theme
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800/50 border-teal-500/30 text-gray-200">
                                    <SelectValue placeholder="Select a theme" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-teal-500/30">
                                  <SelectItem
                                    value="light"
                                    className="text-gray-200"
                                  >
                                    Light
                                  </SelectItem>
                                  <SelectItem
                                    value="dark"
                                    className="text-gray-200"
                                  >
                                    Dark
                                  </SelectItem>
                                  <SelectItem
                                    value="neural-default"
                                    className="text-teal-300"
                                  >
                                    Neural Network (Teal)
                                  </SelectItem>
                                  <SelectItem
                                    value="neural-red"
                                    className="text-red-300"
                                  >
                                    Neural Network (Red)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-gray-400">
                                Select the theme for the application.
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={appearanceForm.control}
                          name="fontSize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Font Size
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800/50 border-teal-500/30 text-gray-200">
                                    <SelectValue placeholder="Select a font size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-teal-500/30">
                                  <SelectItem
                                    value="small"
                                    className="text-gray-200"
                                  >
                                    Small
                                  </SelectItem>
                                  <SelectItem
                                    value="medium"
                                    className="text-gray-200"
                                  >
                                    Medium
                                  </SelectItem>
                                  <SelectItem
                                    value="large"
                                    className="text-gray-200"
                                  >
                                    Large
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-gray-400">
                                Adjust the font size for better readability.
                              </FormDescription>
                              <FormMessage className="text-red-400" />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                        >
                          Save Appearance Settings
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </NeuralCard>
              </TabsContent>

              <TabsContent value="security">
                <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                  <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                  <NeuralDots
                    className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                    count={3}
                  />

                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                      Security Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Add neural styled security settings */}
                    {/* ... existing security settings ... */}
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
