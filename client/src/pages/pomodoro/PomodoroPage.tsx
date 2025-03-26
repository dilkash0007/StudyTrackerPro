import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings } from "@/types";
import { Play, Pause, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

enum TimerMode {
  FOCUS = "Focus",
  SHORT_BREAK = "Short Break",
  LONG_BREAK = "Long Break",
}

export default function PomodoroPage() {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Settings
  const [focusTime, setFocusTime] = useState(25);
  const [shortBreakTime, setShortBreakTime] = useState(5);
  const [longBreakTime, setLongBreakTime] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(true);
  
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user settings
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    onSuccess: (data) => {
      setFocusTime(data.pomodoroFocusMinutes);
      setShortBreakTime(data.pomodoroShortBreakMinutes);
      setLongBreakTime(data.pomodoroLongBreakMinutes);
      setLongBreakInterval(data.pomodoroLongBreakInterval);
      
      // Only set time left if timer isn't running
      if (!isRunning) {
        updateTimeBasedOnMode(mode, {
          focus: data.pomodoroFocusMinutes,
          shortBreak: data.pomodoroShortBreakMinutes,
          longBreak: data.pomodoroLongBreakMinutes,
        });
      }
    }
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      const res = await apiRequest("PUT", "/api/settings", newSettings);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Settings updated",
        description: "Your timer settings have been saved.",
      });
    },
  });

  // Study session mutation
  const createStudySessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const res = await apiRequest("POST", "/api/study-sessions", sessionData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-sessions/stats"] });
      toast({
        title: "Session recorded",
        description: "Your study session has been saved.",
      });
    },
  });

  // Update time based on current mode
  const updateTimeBasedOnMode = (currentMode: TimerMode, times: { focus: number, shortBreak: number, longBreak: number }) => {
    switch (currentMode) {
      case TimerMode.FOCUS:
        setTimeLeft(times.focus * 60);
        break;
      case TimerMode.SHORT_BREAK:
        setTimeLeft(times.shortBreak * 60);
        break;
      case TimerMode.LONG_BREAK:
        setTimeLeft(times.longBreak * 60);
        break;
    }
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            if (mode === TimerMode.FOCUS) {
              // Record completed session
              const duration = focusTime * 60 - 1; // Seconds of focus
              createStudySessionMutation.mutate({
                startTime: new Date(Date.now() - duration * 1000),
                endTime: new Date(),
                duration: Math.floor(duration / 60),
              });
              
              // Completed a pomodoro
              const newCompletedCount = completedPomodoros + 1;
              setCompletedPomodoros(newCompletedCount);
              
              // Check if we need a long break
              if (newCompletedCount % longBreakInterval === 0) {
                setMode(TimerMode.LONG_BREAK);
                setTimeLeft(longBreakTime * 60);
                if (autoStartBreaks) {
                  setTimeout(() => setIsRunning(true), 500);
                }
                toast({
                  title: "Pomodoro completed! 🎉",
                  description: "Time for a long break.",
                });
              } else {
                setMode(TimerMode.SHORT_BREAK);
                setTimeLeft(shortBreakTime * 60);
                if (autoStartBreaks) {
                  setTimeout(() => setIsRunning(true), 500);
                }
                toast({
                  title: "Pomodoro completed! 🎉",
                  description: "Time for a short break.",
                });
              }
            } else {
              // Break completed
              setMode(TimerMode.FOCUS);
              setTimeLeft(focusTime * 60);
              if (autoStartPomodoros) {
                setTimeout(() => setIsRunning(true), 500);
              }
              toast({
                title: "Break completed!",
                description: "Time to focus again.",
              });
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, mode, completedPomodoros, focusTime, shortBreakTime, longBreakTime, longBreakInterval, autoStartBreaks, autoStartPomodoros, toast, createStudySessionMutation]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    updateTimeBasedOnMode(mode, {
      focus: focusTime,
      shortBreak: shortBreakTime,
      longBreak: longBreakTime,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculateProgress = (): number => {
    let totalTime;
    
    switch (mode) {
      case TimerMode.FOCUS:
        totalTime = focusTime * 60;
        break;
      case TimerMode.SHORT_BREAK:
        totalTime = shortBreakTime * 60;
        break;
      case TimerMode.LONG_BREAK:
        totalTime = longBreakTime * 60;
        break;
    }
    
    return 100 - (timeLeft / totalTime * 100);
  };

  const changeMode = (newMode: TimerMode) => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setMode(newMode);
    updateTimeBasedOnMode(newMode, {
      focus: focusTime,
      shortBreak: shortBreakTime,
      longBreak: longBreakTime,
    });
  };

  const saveSettings = () => {
    updateSettingsMutation.mutate({
      pomodoroFocusMinutes: focusTime,
      pomodoroShortBreakMinutes: shortBreakTime,
      pomodoroLongBreakMinutes: longBreakTime,
      pomodoroLongBreakInterval: longBreakInterval,
    });
    
    // Update time based on current mode
    updateTimeBasedOnMode(mode, {
      focus: focusTime,
      shortBreak: shortBreakTime,
      longBreak: longBreakTime,
    });
    
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <MobileHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:leading-9 sm:truncate mb-6">
              Pomodoro Timer
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Timer</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
                        <SettingsIcon className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs 
                      defaultValue={mode} 
                      className="w-full" 
                      value={mode}
                      onValueChange={(value) => changeMode(value as TimerMode)}
                    >
                      <TabsList className="grid w-full grid-cols-3 mb-8">
                        <TabsTrigger value={TimerMode.FOCUS}>Focus</TabsTrigger>
                        <TabsTrigger value={TimerMode.SHORT_BREAK}>Short Break</TabsTrigger>
                        <TabsTrigger value={TimerMode.LONG_BREAK}>Long Break</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value={TimerMode.FOCUS}>
                        <div className="flex flex-col items-center">
                          <div className="text-8xl font-bold mb-8 text-primary">
                            {formatTime(timeLeft)}
                          </div>
                          <Progress value={calculateProgress()} className="w-full h-3 mb-8" />
                          <div className="flex space-x-4">
                            <Button 
                              size="lg" 
                              onClick={toggleTimer}
                              className="px-8"
                            >
                              {isRunning ? (
                                <>
                                  <Pause className="mr-2 h-5 w-5" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-5 w-5" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={resetTimer}
                            >
                              <RotateCcw className="mr-2 h-5 w-5" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value={TimerMode.SHORT_BREAK}>
                        <div className="flex flex-col items-center">
                          <div className="text-8xl font-bold mb-8 text-green-500">
                            {formatTime(timeLeft)}
                          </div>
                          <Progress value={calculateProgress()} className="w-full h-3 mb-8 bg-green-100" indicatorClassName="bg-green-500" />
                          <div className="flex space-x-4">
                            <Button 
                              size="lg" 
                              onClick={toggleTimer}
                              className="px-8 bg-green-500 hover:bg-green-600"
                            >
                              {isRunning ? (
                                <>
                                  <Pause className="mr-2 h-5 w-5" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-5 w-5" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={resetTimer}
                            >
                              <RotateCcw className="mr-2 h-5 w-5" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value={TimerMode.LONG_BREAK}>
                        <div className="flex flex-col items-center">
                          <div className="text-8xl font-bold mb-8 text-blue-500">
                            {formatTime(timeLeft)}
                          </div>
                          <Progress value={calculateProgress()} className="w-full h-3 mb-8 bg-blue-100" indicatorClassName="bg-blue-500" />
                          <div className="flex space-x-4">
                            <Button 
                              size="lg" 
                              onClick={toggleTimer}
                              className="px-8 bg-blue-500 hover:bg-blue-600"
                            >
                              {isRunning ? (
                                <>
                                  <Pause className="mr-2 h-5 w-5" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Play className="mr-2 h-5 w-5" />
                                  Start
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="lg"
                              onClick={resetTimer}
                            >
                              <RotateCcw className="mr-2 h-5 w-5" />
                              Reset
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className={`${isSettingsOpen ? 'block' : 'block'}`}>
                  <CardHeader>
                    <CardTitle>Timer Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="focusTime">Focus Time</Label>
                        <span className="text-sm text-gray-500">{focusTime} minutes</span>
                      </div>
                      <Slider
                        id="focusTime"
                        min={1}
                        max={60}
                        step={1}
                        value={[focusTime]}
                        onValueChange={(value) => setFocusTime(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="shortBreakTime">Short Break</Label>
                        <span className="text-sm text-gray-500">{shortBreakTime} minutes</span>
                      </div>
                      <Slider
                        id="shortBreakTime"
                        min={1}
                        max={15}
                        step={1}
                        value={[shortBreakTime]}
                        onValueChange={(value) => setShortBreakTime(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="longBreakTime">Long Break</Label>
                        <span className="text-sm text-gray-500">{longBreakTime} minutes</span>
                      </div>
                      <Slider
                        id="longBreakTime"
                        min={5}
                        max={30}
                        step={1}
                        value={[longBreakTime]}
                        onValueChange={(value) => setLongBreakTime(value[0])}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="longBreakInterval">Long Break Interval</Label>
                        <span className="text-sm text-gray-500">Every {longBreakInterval} pomodoros</span>
                      </div>
                      <Slider
                        id="longBreakInterval"
                        min={2}
                        max={8}
                        step={1}
                        value={[longBreakInterval]}
                        onValueChange={(value) => setLongBreakInterval(value[0])}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                      </div>
                      <Switch
                        id="autoStartBreaks"
                        checked={autoStartBreaks}
                        onCheckedChange={setAutoStartBreaks}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoStartPomodoros">Auto-start Pomodoros</Label>
                      </div>
                      <Switch
                        id="autoStartPomodoros"
                        checked={autoStartPomodoros}
                        onCheckedChange={setAutoStartPomodoros}
                      />
                    </div>
                    
                    <Button className="w-full" onClick={saveSettings}>
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Session Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{completedPomodoros}</div>
                        <div className="text-sm text-gray-500">Completed</div>
                      </div>
                      
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{(completedPomodoros * focusTime / 60).toFixed(1)}h</div>
                        <div className="text-sm text-gray-500">Focus Time</div>
                      </div>
                    </div>
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
