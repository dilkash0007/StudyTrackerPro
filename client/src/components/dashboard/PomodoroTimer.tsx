import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

enum TimerMode {
  FOCUS = "Focus Time",
  SHORT_BREAK = "Short Break",
  LONG_BREAK = "Long Break",
}

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
  });
  const timerRef = useRef<number | null>(null);
  const { toast } = useToast();

  const { data: settings, isLoading: isLoadingSettings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    onSuccess: (data) => {
      setCustomSettings({
        focusTime: data.pomodoroFocusMinutes,
        shortBreak: data.pomodoroShortBreakMinutes,
        longBreak: data.pomodoroLongBreakMinutes,
      });
      
      // Only set time left if timer isn't running
      if (!isRunning) {
        if (mode === TimerMode.FOCUS) {
          setTimeLeft(data.pomodoroFocusMinutes * 60);
        } else if (mode === TimerMode.SHORT_BREAK) {
          setTimeLeft(data.pomodoroShortBreakMinutes * 60);
        } else {
          setTimeLeft(data.pomodoroLongBreakMinutes * 60);
        }
      }
    }
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            // Timer completed
            clearInterval(timerRef.current!);
            setIsRunning(false);
            
            if (mode === TimerMode.FOCUS) {
              // Completed a pomodoro
              setCompletedPomodoros((prev) => prev + 1);
              
              // Check if we need a long break
              if ((completedPomodoros + 1) % 4 === 0) {
                setMode(TimerMode.LONG_BREAK);
                setTimeLeft(customSettings.longBreak * 60);
                toast({
                  title: "Pomodoro completed!",
                  description: "Time for a long break.",
                });
              } else {
                setMode(TimerMode.SHORT_BREAK);
                setTimeLeft(customSettings.shortBreak * 60);
                toast({
                  title: "Pomodoro completed!",
                  description: "Time for a short break.",
                });
              }
            } else {
              // Break completed
              setMode(TimerMode.FOCUS);
              setTimeLeft(customSettings.focusTime * 60);
              toast({
                title: "Break completed!",
                description: "Time to focus.",
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
  }, [isRunning, mode, completedPomodoros, customSettings, toast]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mode === TimerMode.FOCUS) {
      setTimeLeft(customSettings.focusTime * 60);
    } else if (mode === TimerMode.SHORT_BREAK) {
      setTimeLeft(customSettings.shortBreak * 60);
    } else {
      setTimeLeft(customSettings.longBreak * 60);
    }
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
        totalTime = customSettings.focusTime * 60;
        break;
      case TimerMode.SHORT_BREAK:
        totalTime = customSettings.shortBreak * 60;
        break;
      case TimerMode.LONG_BREAK:
        totalTime = customSettings.longBreak * 60;
        break;
    }
    
    const progress = (1 - timeLeft / totalTime) * 283; // 283 is the circumference of the circle (2 * PI * 45)
    return progress;
  };

  const saveSettings = () => {
    setIsSettingsOpen(false);
    
    // Update time left based on current mode
    if (mode === TimerMode.FOCUS) {
      setTimeLeft(customSettings.focusTime * 60);
    } else if (mode === TimerMode.SHORT_BREAK) {
      setTimeLeft(customSettings.shortBreak * 60);
    } else {
      setTimeLeft(customSettings.longBreak * 60);
    }
    
    toast({
      title: "Settings updated",
      description: "Your timer settings have been updated.",
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Pomodoro Timer</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            {/* Progress circle */}
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke={mode === TimerMode.FOCUS ? "#4F46E5" : "#F97316"} 
              strokeWidth="8" 
              strokeDasharray="283" 
              strokeDashoffset={283 - calculateProgress()} 
              strokeLinecap="round" 
              transform="rotate(-90 50 50)" 
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoadingSettings ? (
              <Skeleton className="h-10 w-24 mb-2" />
            ) : (
              <>
                <span className="text-4xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
                <span className="text-sm text-gray-500">{mode}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          <Button 
            className={mode === TimerMode.FOCUS ? "bg-primary hover:bg-primary/90" : "bg-orange-500 hover:bg-orange-600"}
            onClick={toggleTimer}
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
          <Button variant="outline" onClick={resetTimer}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <div className="flex flex-col w-full mt-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Focus Time</span>
            <span className="text-sm font-medium text-gray-900">{customSettings.focusTime} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Short Break</span>
            <span className="text-sm font-medium text-gray-900">{customSettings.shortBreak} min</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Long Break</span>
            <span className="text-sm font-medium text-gray-900">{customSettings.longBreak} min</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full">
              <SettingsIcon className="mr-2 h-4 w-4" />
              Customize Timer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="focusTime">Focus Time (minutes)</Label>
                <Input
                  id="focusTime"
                  type="number"
                  min="1"
                  max="60"
                  value={customSettings.focusTime}
                  onChange={(e) => setCustomSettings({ 
                    ...customSettings, 
                    focusTime: parseInt(e.target.value) || customSettings.focusTime 
                  })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  min="1"
                  max="30"
                  value={customSettings.shortBreak}
                  onChange={(e) => setCustomSettings({ 
                    ...customSettings, 
                    shortBreak: parseInt(e.target.value) || customSettings.shortBreak 
                  })}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="longBreak">Long Break (minutes)</Label>
                <Input
                  id="longBreak"
                  type="number"
                  min="1"
                  max="60"
                  value={customSettings.longBreak}
                  onChange={(e) => setCustomSettings({ 
                    ...customSettings, 
                    longBreak: parseInt(e.target.value) || customSettings.longBreak 
                  })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveSettings}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
