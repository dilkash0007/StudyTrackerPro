import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Settings as SettingsIcon,
  Brain,
  Timer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { Settings } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  NeuralDots,
  NeuralCardHeader,
  PulsingDot,
} from "@/components/ui/NeuralDesignElements";

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
    },
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
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
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

  const getModeColor = () => {
    switch (mode) {
      case TimerMode.FOCUS:
        return { light: "#2DD4BF", dark: "#0D9488" }; // Teal colors
      case TimerMode.SHORT_BREAK:
        return { light: "#38BDF8", dark: "#0284C7" }; // Sky blue colors
      case TimerMode.LONG_BREAK:
        return { light: "#818CF8", dark: "#4F46E5" }; // Indigo colors
    }
  };

  const modeColor = getModeColor();

  return (
    <Card className="h-full flex flex-col relative overflow-hidden">
      <NeuralDots className="absolute top-0 right-0 w-28 h-28 opacity-20" />
      <NeuralCardHeader
        title="Neuro Timer"
        icon={<Timer className="w-5 h-5 text-teal-400" />}
      />
      <CardContent className="flex-grow flex flex-col items-center justify-center pt-6">
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Glow filter */}
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="8"
            />

            {/* Neural network decorative elements */}
            <circle
              cx="20"
              cy="30"
              r="2"
              fill={modeColor.light}
              opacity="0.6"
            />
            <circle
              cx="80"
              cy="30"
              r="2"
              fill={modeColor.light}
              opacity="0.6"
            />
            <circle
              cx="35"
              cy="80"
              r="2"
              fill={modeColor.light}
              opacity="0.6"
            />
            <circle
              cx="65"
              cy="80"
              r="2"
              fill={modeColor.light}
              opacity="0.6"
            />

            <line
              x1="20"
              y1="30"
              x2="50"
              y2="50"
              stroke={modeColor.light}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1="80"
              y1="30"
              x2="50"
              y2="50"
              stroke={modeColor.light}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1="35"
              y1="80"
              x2="50"
              y2="50"
              stroke={modeColor.light}
              strokeWidth="0.5"
              opacity="0.4"
            />
            <line
              x1="65"
              y1="80"
              x2="50"
              y2="50"
              stroke={modeColor.light}
              strokeWidth="0.5"
              opacity="0.4"
            />

            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`url(#gradientStroke)`}
              strokeWidth="8"
              strokeDasharray="283"
              strokeDashoffset={283 - calculateProgress()}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              filter="url(#glow)"
            />

            {/* Gradient definition */}
            <linearGradient
              id="gradientStroke"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={modeColor.light} />
              <stop offset="100%" stopColor={modeColor.dark} />
            </linearGradient>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoadingSettings ? (
              <Skeleton className="h-10 w-24 mb-2 bg-gray-800" />
            ) : (
              <>
                <span className="text-4xl font-bold">
                  {formatTime(timeLeft)}
                </span>
                <div className="flex items-center text-sm text-gray-400 mt-1">
                  <span>{mode}</span>
                  <PulsingDot
                    className="ml-2"
                    color={`bg-${
                      mode === TimerMode.FOCUS
                        ? "teal"
                        : mode === TimerMode.SHORT_BREAK
                        ? "sky"
                        : "indigo"
                    }-400`}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex space-x-3 mt-2">
          <Button
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 border-0 shadow-lg shadow-teal-900/20"
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
          <Button
            variant="outline"
            onClick={resetTimer}
            className="border-teal-500/30 text-teal-300 hover:bg-teal-900/20"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="flex flex-col w-full mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs backdrop-blur-sm bg-opacity-10 bg-white p-2 rounded">
            <span className="font-medium text-gray-300 flex items-center">
              <Brain className="h-3 w-3 mr-1 text-teal-400" />
              Focus Time
            </span>
            <span className="font-medium text-teal-300">
              {customSettings.focusTime} min
            </span>
          </div>
          <div className="flex items-center justify-between text-xs backdrop-blur-sm bg-opacity-10 bg-white p-2 rounded">
            <span className="font-medium text-gray-300">Short Break</span>
            <span className="font-medium text-sky-300">
              {customSettings.shortBreak} min
            </span>
          </div>
          <div className="flex items-center justify-between text-xs backdrop-blur-sm bg-opacity-10 bg-white p-2 rounded">
            <span className="font-medium text-gray-300">Long Break</span>
            <span className="font-medium text-indigo-300">
              {customSettings.longBreak} min
            </span>
          </div>
          <div className="flex items-center justify-between text-xs backdrop-blur-sm bg-opacity-10 bg-white p-2 rounded">
            <span className="font-medium text-gray-300">Pomodoros</span>
            <span className="font-medium text-amber-300">
              {completedPomodoros}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-teal-400 hover:text-teal-300 hover:bg-teal-900/20"
          onClick={() => setIsSettingsOpen(true)}
        >
          <SettingsIcon className="h-4 w-4 mr-1" />
          Settings
        </Button>

        {/* Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="border border-teal-500/30 bg-gray-900/90 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2 text-teal-400" />
                Timer Settings
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="focusTime">Focus Time (minutes)</Label>
                <Input
                  id="focusTime"
                  type="number"
                  value={customSettings.focusTime}
                  onChange={(e) =>
                    setCustomSettings({
                      ...customSettings,
                      focusTime: parseInt(e.target.value) || 25,
                    })
                  }
                  min="1"
                  max="60"
                  className="border-teal-500/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  value={customSettings.shortBreak}
                  onChange={(e) =>
                    setCustomSettings({
                      ...customSettings,
                      shortBreak: parseInt(e.target.value) || 5,
                    })
                  }
                  min="1"
                  max="30"
                  className="border-teal-500/30"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="longBreak">Long Break (minutes)</Label>
                <Input
                  id="longBreak"
                  type="number"
                  value={customSettings.longBreak}
                  onChange={(e) =>
                    setCustomSettings({
                      ...customSettings,
                      longBreak: parseInt(e.target.value) || 15,
                    })
                  }
                  min="1"
                  max="60"
                  className="border-teal-500/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsSettingsOpen(false)}
                className="border-teal-500/30 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={saveSettings}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 border-0"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
