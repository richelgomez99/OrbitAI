import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Play, Pause, RotateCcw, XCircle, Zap, Brain, Coffee, Wind } from 'lucide-react';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const moodOptions = [
  { label: "Energized", value: "energized", icon: <Zap className="h-4 w-4 mr-2" /> },
  { label: "Focused", value: "focused", icon: <Brain className="h-4 w-4 mr-2" /> },
  { label: "Chill", value: "chill", icon: <Coffee className="h-4 w-4 mr-2" /> },
  { label: "Drifting", value: "drifting", icon: <Wind className="h-4 w-4 mr-2" /> },
];

const FlowDashboardContent: React.FC = () => {
  const [focusTask, setFocusTask] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState<string>("");
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [currentMood, setCurrentMood] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && focusTask) {
      interval = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, focusTask]);

  const handleSetFocusTask = () => {
    if (taskInput.trim() === "") return;
    setFocusTask(taskInput.trim());
    setTaskInput("");
    setTimeElapsed(0);
    setTimerActive(false);
  };

  const handleToggleTimer = () => {
    if (!focusTask) return;
    setTimerActive(!timerActive);
  };

  const handleResetTimer = () => {
    setTimeElapsed(0);
    setTimerActive(false);
  };

  const handleClearTask = () => {
    setFocusTask(null);
    setTimeElapsed(0);
    setTimerActive(false);
    setTaskInput("");
  };
  
  const handleSelectMood = (moodValue: string) => {
    setCurrentMood(moodValue);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 Set Your Flow Focus</CardTitle>
          <CardDescription>What's the one thing you want to immerse yourself in?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="e.g., Draft chapter 1 of novel..."
              className="flex-grow"
              onKeyPress={(e) => e.key === 'Enter' && handleSetFocusTask()}
            />
            <Button onClick={handleSetFocusTask}>Set Focus</Button>
          </div>
        </CardContent>
      </Card>

      {focusTask && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Focus: {focusTask}</span>
              <Button variant="ghost" size="sm" onClick={handleClearTask} className="text-red-500 hover:text-red-700">
                <XCircle className="h-4 w-4 mr-1" /> Clear
              </Button>
            </CardTitle>
            <CardDescription>Stay in the zone. Time is on your side.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-6xl font-mono text-center py-4 bg-slate-800/50 rounded-lg">
              <Timer className="inline-block h-12 w-12 mr-4 -mt-2" />
              {formatTime(timeElapsed)}
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleToggleTimer} variant={timerActive ? "outline" : "default"} className="w-28">
                {timerActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {timerActive ? "Pause" : "Start"}
              </Button>
              <Button onClick={handleResetTimer} variant="outline" className="w-28">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>🌊 How's Your Flow?</CardTitle>
          <CardDescription>Select your current state. This can help adapt future suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moodOptions.map((mood) => (
            <Button
              key={mood.value}
              variant={currentMood === mood.value ? "default" : "outline"}
              onClick={() => handleSelectMood(mood.value)}
              className={`flex items-center justify-center ${currentMood === mood.value ? 'ring-2 ring-offset-2 ring-offset-background ring-primary' : ''}`}
            >
              {mood.icon}
              {mood.label}
            </Button>
          ))}
        </CardContent>
        {currentMood && <p className="text-sm text-center mt-3 text-slate-400">Current state: {moodOptions.find(m => m.value === currentMood)?.label}</p>}
      </Card>
      
      <Card className="bg-slate-800/30 border-dashed">
         <CardHeader>
            <CardTitle className="text-sm text-slate-400">🔮 AI Flow Companion (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-xs text-slate-500">Future AI suggestions based on your task, time, and mood will appear here to help you maintain momentum or transition smoothly.</p>
        </CardContent>
      </Card>

    </div>
  );
};

export default FlowDashboardContent;
