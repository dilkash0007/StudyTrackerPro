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
import {
  NeuralDots,
  NeuralBackgroundDecoration,
  NeuralCard,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

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
    },
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
      queryClient.invalidateQueries({
        queryKey: ["/api/study-sessions/stats"],
      });
      toast({
        title: "Session recorded",
        description: "Your study session has been saved.",
      });
    },
  });

  // Update time based on current mode
  const updateTimeBasedOnMode = (
    currentMode: TimerMode,
    times: { focus: number; shortBreak: number; longBreak: number }
  ) => {
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
  }, [
    isRunning,
    mode,
    completedPomodoros,
    focusTime,
    shortBreakTime,
    longBreakTime,
    longBreakInterval,
    autoStartBreaks,
    autoStartPomodoros,
    toast,
    createStudySessionMutation,
  ]);

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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

    return 100 - (timeLeft / totalTime) * 100;
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
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <NeuralBackgroundDecoration />

        <div className="absolute top-1/4 -right-24 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>

        <MobileHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                Pomodoro Timer
              </h1>
              <p className="text-gray-400">
                Stay focused and manage your study sessions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timer Card */}
              <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                <NeuralDots
                  className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                  count={3}
                />

                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                    {mode} Timer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-6">
                    <div className="w-full flex justify-between mb-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-teal-500/30 hover:bg-teal-900/20 ${
                          mode === TimerMode.FOCUS
                            ? "bg-teal-500/20 text-teal-300"
                            : "text-gray-300"
                        }`}
                        onClick={() => changeMode(TimerMode.FOCUS)}
                      >
                        Focus
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-teal-500/30 hover:bg-teal-900/20 ${
                          mode === TimerMode.SHORT_BREAK
                            ? "bg-teal-500/20 text-teal-300"
                            : "text-gray-300"
                        }`}
                        onClick={() => changeMode(TimerMode.SHORT_BREAK)}
                      >
                        Short Break
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`border-teal-500/30 hover:bg-teal-900/20 ${
                          mode === TimerMode.LONG_BREAK
                            ? "bg-teal-500/20 text-teal-300"
                            : "text-gray-300"
                        }`}
                        onClick={() => changeMode(TimerMode.LONG_BREAK)}
                      >
                        Long Break
                      </Button>
                    </div>

                    <div className="text-7xl font-bold text-teal-300">
                      {formatTime(timeLeft)}
                    </div>

                    <Progress
                      value={calculateProgress()}
                      className="w-full h-2 bg-gray-800"
                    />

                    <div className="flex space-x-4">
                      <Button
                        onClick={toggleTimer}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                      >
                        {isRunning ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={resetTimer}
                        variant="outline"
                        className="border-teal-500/30 hover:bg-teal-900/20 text-gray-300"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>

                    <div className="text-sm text-gray-400">
                      Completed pomodoros:{" "}
                      <span className="text-teal-300">
                        {completedPomodoros}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Settings Card */}
              <Card className="relative overflow-hidden backdrop-blur-sm bg-gray-900/50 border-teal-500/30">
                <NeuralDots className="absolute top-0 right-0 w-32 h-32 opacity-10" />
                <NeuralDots
                  className="absolute bottom-0 left-0 w-24 h-24 opacity-5"
                  count={3}
                />

                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-teal-300 to-cyan-300 text-transparent bg-clip-text">
                    Timer Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Focus Time ({focusTime} minutes)
                      </Label>
                      <Slider
                        value={[focusTime]}
                        min={1}
                        max={60}
                        step={1}
                        onValueChange={(value) => setFocusTime(value[0])}
                        className="text-teal-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Short Break ({shortBreakTime} minutes)
                      </Label>
                      <Slider
                        value={[shortBreakTime]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={(value) => setShortBreakTime(value[0])}
                        className="text-cyan-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Long Break ({longBreakTime} minutes)
                      </Label>
                      <Slider
                        value={[longBreakTime]}
                        min={5}
                        max={60}
                        step={1}
                        onValueChange={(value) => setLongBreakTime(value[0])}
                        className="text-emerald-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">
                        Long Break Interval ({longBreakInterval} sessions)
                      </Label>
                      <Slider
                        value={[longBreakInterval]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) =>
                          setLongBreakInterval(value[0])
                        }
                        className="text-teal-400"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-break" className="text-gray-300">
                          Auto-start breaks
                        </Label>
                        <Switch
                          id="auto-break"
                          checked={autoStartBreaks}
                          onCheckedChange={setAutoStartBreaks}
                          className="data-[state=checked]:bg-teal-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="auto-pomodoro"
                          className="text-gray-300"
                        >
                          Auto-start pomodoros
                        </Label>
                        <Switch
                          id="auto-pomodoro"
                          checked={autoStartPomodoros}
                          onCheckedChange={setAutoStartPomodoros}
                          className="data-[state=checked]:bg-teal-500"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={saveSettings}
                      className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 border-0 hover:from-teal-600 hover:to-cyan-600"
                    >
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
