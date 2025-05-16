import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrbit } from '@/context/orbit-context';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, Mode, getModeTheme } from '@/lib/utils';
import { PlayCircle, Timer, ListChecks, ChevronRight, Flame, CircleOff, Clock, Target, CheckCircle, Plus } from 'lucide-react';
import ModeGuidance from '../ModeGuidance';

const priorityOrder: Record<Task['priority'], number> = {
  high: 1,
  medium: 2,
  low: 3,
};

interface BuildDashboardContentProps {
  tasks: Task[];
  sortBy: string;
}

const BuildDashboardContent: React.FC<BuildDashboardContentProps> = ({ tasks, sortBy }) => {
  const { setMode, setShowAddTaskModal, focusStreak, setShowTaskDetailModal, setTaskForDetailView } = useOrbit();

  const [pomodoroActive, setPomodoroActive] = useState(false);
  const POMODORO_DURATION = 25 * 60; // 25 minutes in seconds
  const [pomodoroTime, setPomodoroTime] = useState(POMODORO_DURATION);
  const [showPomodoroTimer, setShowPomodoroTimer] = useState(false);

  const activeTasks = React.useMemo(() => 
    tasks
      .filter(task => task.status === 'todo')
      .sort((a, b) => {
        switch (sortBy) {
          case 'priority':
            return priorityOrder[a.priority] - priorityOrder[b.priority] || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'dueDate':
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime() || priorityOrder[a.priority] - priorityOrder[b.priority];
          case 'created':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || priorityOrder[a.priority] - priorityOrder[b.priority];
          default:
            return 0;
        }
      }),
    [tasks, sortBy]
  );

  const focusTask = activeTasks[0];
  const upcomingTasks = activeTasks.slice(1, 4);
  
  // Calculate task completion rate for the day
  const completedToday = tasks.filter(
    task => task.status === 'done' && 
    task.lastUpdated && 
    new Date(task.lastUpdated).toDateString() === new Date().toDateString()
  ).length;

  // Calculate current streak
  const calculateCurrentStreak = (streakArray: boolean[]): number => {
    let currentStreak = 0;
    for (let i = streakArray.length - 1; i >= 0; i--) {
      if (streakArray[i]) {
        currentStreak++;
      } else {
        break; // Streak broken
      }
    }
    return currentStreak;
  };
  const currentStreakCount = calculateCurrentStreak(focusStreak);

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

  const modeTheme = getModeTheme('build');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const statsVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Streak Display Section */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-md overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Flame className="mr-2 h-5 w-5 text-orange-500" /> Current Streak: {currentStreakCount} day{currentStreakCount === 1 ? '' : 's'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex space-x-2 justify-center pb-4">
            {Array(focusStreak.length).fill(false).map((_, index) => {
              const isActive = index >= focusStreak.length - currentStreakCount;
              const dayNumber = focusStreak.length - index;
              return (
                <div 
                  key={index}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
                  title={`Day ${dayNumber}`}
                >
                  {dayNumber}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
      {/* Mode Guidance */}
      <motion.div variants={itemVariants}>
        <ModeGuidance mode="build" />
      </motion.div>
      
      {/* Productivity Stats */}
      <motion.div 
        className="grid gap-4 md:grid-cols-3"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <motion.div 
            className="h-full"
            variants={statsVariants}
            whileHover="hover"
          >
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Focus Streak</p>
                    <p className="text-2xl font-bold">{currentStreakCount} days</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Flame className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <motion.div 
            className="h-full"
            variants={statsVariants}
            whileHover="hover"
          >
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                    <p className="text-2xl font-bold">{activeTasks.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <ListChecks className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <motion.div 
            className="h-full"
            variants={statsVariants}
            whileHover="hover"
          >
            <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 h-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                    <p className="text-2xl font-bold">{completedToday}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Focus Task Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-900/10 to-indigo-900/10">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Focus Task
              </CardTitle>
              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                Build Mode
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {focusTask ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{focusTask.title}</h3>
                  {focusTask.description && (
                    <p className="text-sm text-muted-foreground">
                      {focusTask.description.length > 100 
                        ? `${focusTask.description.substring(0, 100)}...` 
                        : focusTask.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      focusTask.priority === 'high' ? 'bg-red-100 text-red-800' :
                      focusTask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {focusTask.priority}
                    </span>
                    {focusTask.dueDate && (
                      <span className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {new Date(focusTask.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setTaskForDetailView(focusTask);
                      setShowTaskDetailModal(true);
                    }}
                  >
                    <PlayCircle className="w-4 h-4" />
                    Start Working
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-purple-400 border-purple-500/50 hover:bg-purple-500/10"
                    onClick={() => setShowPomodoroTimer(!showPomodoroTimer)}
                  >
                    <Timer className="w-4 h-4" />
                    {showPomodoroTimer ? 'Hide Timer' : 'Start Pomodoro'}
                  </Button>
                </div>
                
                {showPomodoroTimer && (
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Pomodoro Timer</span>
                      <span className="text-sm">
                        {Math.floor(pomodoroTime / 60)}:{(pomodoroTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-full bg-purple-500/20 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(pomodoroTime / POMODORO_DURATION) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getPriorityBadgeVariant(focusTask.priority)}>
                          {focusTask.priority}
                        </Badge>
                        {focusTask.dueDate && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(focusTask.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-auto"
                        onClick={() => {
                          setTaskForDetailView(focusTask);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CircleOff className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium mb-2">No focus task</h3>
                <p className="text-muted-foreground mb-4">All caught up! Add a new task to get started.</p>
                <Button 
                  onClick={() => setShowAddTaskModal(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default BuildDashboardContent;
