import React, { useState, useEffect } from 'react';
import { useTaskList } from '@/hooks/useTaskList';
import { Button } from '../ui/button';
import { Play, Pause, Check, X, SkipForward } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useOrbitMode } from '@/context/OrbitModeContext';

export const FlowMode: React.FC = () => {
  const { tasks, updateTask, loading: tasksLoading } = useTaskList();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const { activeSession } = useOrbitMode();

  // Filter tasks that are not completed and sort by priority
  const availableTasks = React.useMemo(() => {
    return tasks
      .filter(task => task.status !== 'DONE')
      .sort((a, b) => {
        // Sort by priority (HIGH > MEDIUM > LOW)
        const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      });
  }, [tasks]);

  const currentTask = availableTasks[currentTaskIndex];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && sessionStartTime) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, sessionStartTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    if (!currentTask) return;
    
    setIsPlaying(true);
    setSessionStartTime(new Date());
    setTimeElapsed(0);
    
    // Update task status to IN_PROGRESS
    updateTask(currentTask.id, { status: 'IN_PROGRESS' });
  };

  const pauseSession = () => {
    setIsPlaying(false);
  };

  const completeTask = async () => {
    if (!currentTask) return;
    
    try {
      await updateTask(currentTask.id, {
        status: 'DONE',
        completedAt: new Date(),
      });
      
      toast({
        title: 'Task completed!',
        description: 'Great job focusing on this task.',
      });
      
      // Move to next task or end session
      if (currentTaskIndex < availableTasks.length - 1) {
        setCurrentTaskIndex(prev => prev + 1);
      } else {
        endSession();
      }
    } catch (err) {
      console.error('Error completing task:', err);
      toast({
        title: 'Error',
        description: 'Failed to complete task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const skipTask = () => {
    if (currentTaskIndex < availableTasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
    } else {
      endSession();
    }
  };

  const endSession = () => {
    setIsPlaying(false);
    setSessionStartTime(null);
    setTimeElapsed(0);
    
    toast({
      title: 'Flow session ended',
      description: 'Take a moment to reflect on your progress.',
    });
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (availableTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
        <h2 className="text-xl font-medium">No tasks available</h2>
        <p className="text-muted-foreground">
          Add some tasks in Build mode to get started with Flow mode.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
      <div className="w-full max-w-2xl p-8 space-y-8 bg-muted/30 rounded-xl">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Flow Mode
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isPlaying 
              ? 'Stay focused on this task...' 
              : 'Eliminate distractions and focus on one task at a time'}
          </p>
        </div>

        {currentTask ? (
          <div className="space-y-6">
            <div className="p-6 bg-background rounded-lg shadow-sm border border-border">
              <div className="text-5xl font-bold font-mono">
                {formatTime(timeElapsed)}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Current Task</div>
                <h2 className="text-xl font-semibold">{currentTask.title}</h2>
                {currentTask.description && (
                  <p className="mt-2 text-muted-foreground">{currentTask.description}</p>
                )}
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              {!isPlaying ? (
                <Button 
                  size="lg" 
                  className="px-8"
                  onClick={startSession}
                  disabled={!currentTask}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Focus
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={pauseSession}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg" 
                    onClick={completeTask}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={skipTask}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No tasks available. Add some tasks in Build mode.</p>
          </div>
        )}
      </div>

      {isPlaying && (
        <div className="text-sm text-muted-foreground">
          Press <kbd className="px-2 py-1 text-xs border rounded bg-muted">Esc</kbd> to exit flow mode
        </div>
      )}
    </div>
  );
};

export default FlowMode;
