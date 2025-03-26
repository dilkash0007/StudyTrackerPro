import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import TaskManagement from "@/components/dashboard/TaskManagement";
import PomodoroTimer from "@/components/dashboard/PomodoroTimer";
import StudyProgressChart from "@/components/dashboard/StudyProgressChart";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { user } = useAuth();
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startNewSession = async () => {
    try {
      const startTime = new Date();
      
      await apiRequest("POST", "/api/study-sessions", {
        startTime,
        subject,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
      
      toast({
        title: "Study session started",
        description: `Your ${subject || "study"} session has started. Good luck!`,
      });
      
      setIsNewSessionDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error starting session",
        description: "There was an error starting your study session. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            {/* Dashboard Header */}
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate">
                  Dashboard
                </h2>
              </div>
              <div className="flex mt-4 md:mt-0 md:ml-4">
                <Dialog open={isNewSessionDialogOpen} onOpenChange={setIsNewSessionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Study Session
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Study Session</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Select value={subject} onValueChange={setSubject}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Math">Math</SelectItem>
                            <SelectItem value="History">History</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={startNewSession}>Start Session</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

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

            {/* Study Progress and Upcoming Events */}
            <div className="grid grid-cols-1 gap-5 mt-8 lg:grid-cols-3">
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
