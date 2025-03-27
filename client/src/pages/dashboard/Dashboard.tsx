import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import TaskManagement from "@/components/dashboard/TaskManagement";
import PomodoroTimer from "@/components/dashboard/PomodoroTimer";
import StudyProgressChart from "@/components/dashboard/StudyProgressChart";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { Brain, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NeuralSeparator,
  NeuralBackgroundDecoration,
  PulsingDot,
  NeuralNetIcon,
} from "@/components/ui/NeuralDesignElements";
import { useTheme } from "@/contexts/ThemeContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { theme } = useTheme();
  const isRedTheme = theme === "neural-red";

  const startNewSession = async () => {
    try {
      const startTime = new Date();

      await apiRequest("POST", "/api/study-sessions", {
        startTime,
        subject,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/study-sessions/stats"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });

      toast({
        title: "Study session started",
        description: `Your ${
          subject || "study"
        } session has started. Good luck!`,
      });

      setIsNewSessionDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error starting session",
        description:
          "There was an error starting your study session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
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
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <NeuralNetIcon
                  className={`w-7 h-7 ${
                    isRedTheme ? "text-rose-400" : "text-teal-400"
                  }`}
                />
                <h1
                  className={`text-2xl font-bold bg-gradient-to-r ${
                    isRedTheme
                      ? "from-rose-300 to-red-300"
                      : "from-teal-300 to-cyan-300"
                  } text-transparent bg-clip-text`}
                >
                  Neural Dashboard
                </h1>
                <PulsingDot className="mt-2" />
              </div>
              <div className="flex">
                <Dialog
                  open={isNewSessionDialogOpen}
                  onOpenChange={setIsNewSessionDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className={`${
                        isRedTheme
                          ? "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
                          : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                      } border-0`}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      New Study Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className={`border ${
                      isRedTheme ? "border-rose-500/30" : "border-teal-500/30"
                    } bg-gray-900/90 backdrop-blur-md`}
                  >
                    <DialogHeader>
                      <DialogTitle className="flex items-center">
                        <Brain
                          className={`w-5 h-5 mr-2 ${
                            isRedTheme ? "text-rose-400" : "text-teal-400"
                          }`}
                        />
                        <span>Start New Study Session</span>
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="subject" className="text-gray-300">
                          Subject
                        </Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger
                            className={`border-${
                              isRedTheme ? "rose" : "teal"
                            }-500/30 bg-gray-900/60 text-gray-200`}
                          >
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent
                            className={`border-${
                              isRedTheme ? "rose" : "teal"
                            }-500/30 bg-gray-900/90 backdrop-blur-md`}
                          >
                            <SelectItem
                              value="Physics"
                              className="text-gray-200"
                            >
                              Physics
                            </SelectItem>
                            <SelectItem value="Math" className="text-gray-200">
                              Math
                            </SelectItem>
                            <SelectItem
                              value="History"
                              className="text-gray-200"
                            >
                              History
                            </SelectItem>
                            <SelectItem
                              value="Chemistry"
                              className="text-gray-200"
                            >
                              Chemistry
                            </SelectItem>
                            <SelectItem
                              value="Biology"
                              className="text-gray-200"
                            >
                              Biology
                            </SelectItem>
                            <SelectItem
                              value="English"
                              className="text-gray-200"
                            >
                              English
                            </SelectItem>
                            <SelectItem
                              value="Computer Science"
                              className="text-gray-200"
                            >
                              Computer Science
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={startNewSession}
                        className={`${
                          isRedTheme
                            ? "bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600"
                            : "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                        } border-0`}
                      >
                        Start Session
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <NeuralSeparator className="my-4" />

            {/* Stats Overview */}
            <StatsOverview />

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-3">
              {/* Task Management Section */}
              <div className="lg:col-span-2">
                <TaskManagement />
              </div>

              {/* Pomodoro Timer Section */}
              <div className="lg:col-span-1">
                <PomodoroTimer />
              </div>
            </div>

            <NeuralSeparator className="my-6" />

            {/* Study Progress and Upcoming Events */}
            <div className="grid grid-cols-1 gap-5 mt-6 lg:grid-cols-3">
              {/* Study Progress Chart */}
              <div className="lg:col-span-2">
                <StudyProgressChart />
              </div>

              {/* Upcoming Events */}
              <div className="lg:col-span-1">
                <UpcomingEvents />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mt-8">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
