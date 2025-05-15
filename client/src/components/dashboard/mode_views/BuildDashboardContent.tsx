import React, { useState, useEffect, useCallback } from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/lib/utils'; // Assuming Task type is exported from utils
import { PlayCircle, Timer, ListChecks, ChevronRight, AlertTriangle } from 'lucide-react';

const priorityOrder: Record<Task['priority'], number> = {
  high: 1,
  medium: 2,
  low: 3,
};

const BuildDashboardContent: React.FC = () => {
  const { tasks, setMode, setShowAddTaskModal } = useOrbit();

  const [pomodoroActive, setPomodoroActive] = useState(false);
  const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_DURATION);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);

  const activeTasks = tasks.filter(task => task.status === 'todo')
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const focusTask = activeTasks.length > 0 ? activeTasks[0] : null;
  const upcomingTasks = activeTasks.slice(1, 4); // Show next 3 upcoming tasks

  const handleStartFlowSession = () => {
    // Optionally, could set focusTask as active in context if such a feature is added
    setMode('flow');
  };

  const handleStartPomodoro = useCallback(() => {
    if (!pomodoroActive) {
      setPomodoroTime(POMODORO_DURATION);
      setPomodoroActive(true);
      setShowPomodoroTimer(true);
    } else {
      setPomodoroActive(false);
      // setShowPomodoroTimer(false); // Or keep showing time paused
    }
  }, [pomodoroActive, POMODORO_DURATION]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (pomodoroActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (pomodoroTime === 0 && pomodoroActive) {
      setPomodoroActive(false);
      alert('Pomodoro session finished!'); // Replace with a proper notification later
      setShowPomodoroTimer(false);
    }
    return () => clearInterval(interval);
  }, [pomodoroActive, pomodoroTime]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Focus Task Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6 text-primary" /> Focus Task</CardTitle>
          {!focusTask && <CardDescription>No active tasks to focus on. Add some!</CardDescription>}
        </CardHeader>
        {focusTask && (
          <CardContent>
            <h3 className="text-xl font-semibold mb-1">{focusTask.title}</h3>
            <div className="flex items-center space-x-2 mb-3">
              <Badge variant={getPriorityBadgeVariant(focusTask.priority)}>{focusTask.priority.toUpperCase()}</Badge>
              {focusTask.dueDate && <Badge variant="outline">Due: {new Date(focusTask.dueDate).toLocaleDateString()}</Badge>}
            </div>
            {focusTask.description && <p className="text-sm text-neutral-500 mb-3 line-clamp-2">{focusTask.description}</p>}
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              View Details <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Quick Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {showPomodoroTimer && (
          <Card className="md:col-span-2 p-4 flex flex-col items-center justify-center bg-card text-card-foreground border-primary border-2">
            <p className="text-4xl font-bold text-primary">{formatTime(pomodoroTime)}</p>
            <p className="text-sm text-muted-foreground">{pomodoroActive ? "Focus Session in Progress" : "Pomodoro Paused"}</p>
          </Card>
        )}
        <Button 
          className="w-full py-6 text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md flex items-center justify-center"
          onClick={handleStartFlowSession}
        >
          <PlayCircle className="mr-2 h-6 w-6" /> Start Flow Session
        </Button>
        <Button 
          variant="outline" 
          className="w-full py-6 text-lg border-primary text-primary hover:bg-primary/10 shadow-md flex items-center justify-center"
          onClick={handleStartPomodoro}
        >
          <Timer className="mr-2 h-6 w-6" /> {pomodoroActive ? 'Pause Pomodoro' : (pomodoroTime < POMODORO_DURATION && pomodoroTime > 0 ? 'Resume Pomodoro' : 'Start Pomodoro')}
        </Button>
      </div>

      {/* Upcoming Tasks Section */}
      {upcomingTasks.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Next Up</CardTitle>
            <CardDescription>Other tasks to tackle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map(task => (
              <Card key={task.id} className="p-3 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority}</Badge>
                      {task.dueDate && <Badge variant="outline">{new Date(task.dueDate).toLocaleDateString()}</Badge>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
      
      {activeTasks.length === 0 && !focusTask && (
         <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center text-neutral-500 py-8">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-3" />
              <p className="text-lg font-semibold">No active tasks!</p>
              <p>Add new tasks to start building momentum.</p>
              <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setShowAddTaskModal(true)}>
                Add New Task
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuildDashboardContent;
