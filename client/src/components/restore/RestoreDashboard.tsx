import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOrbit } from '@/context/orbit-context';
import { Task } from '@/lib/utils';
import { GentleWins } from './GentleWins';
import { MomentOfCalm } from './MomentOfCalm';
import { SelfCareSuggestions } from './SelfCareSuggestions';
import { ReflectionEntry } from './ReflectionEntry';

interface RestoreDashboardProps {
  energyLevel?: 'low' | 'medium' | 'high';
  previousMode?: 'build' | 'flow' | 'restore';
}

export const RestoreDashboard: React.FC<RestoreDashboardProps> = ({
  energyLevel = 'medium',
  previousMode = 'build',
}) => {
  const { tasks, addReflection } = useOrbit();
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

  // Filter completed tasks from the last 24 hours
  useEffect(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentCompleted = tasks.filter(task => {
      const updatedAt = task.updatedAt || task.lastUpdated || task.createdAt;
      return task.status === 'done' && 
             updatedAt && 
             new Date(updatedAt) >= twentyFourHoursAgo;
    });
    
    setCompletedTasks(recentCompleted);
  }, [tasks]);

  const handleAddWin = async (win: string) => {
    // In a real app, you might want to save this to your backend
    console.log('Gentle win added:', win);
  };

  const handleSubmitReflection = async (reflection: {
    wins: string;
    struggles: string;
    mood: string;
    journalEntry: string;
  }) => {
    await addReflection({
      wins: reflection.wins,
      struggles: reflection.struggles,
      journalEntry: reflection.journalEntry,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
          Restore Mode
        </h1>
        <p className="text-muted-foreground text-sm">
          Take a moment to pause, reflect, and recharge.
        </p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          >
            <GentleWins 
              completedTasks={completedTasks}
              onAddWin={handleAddWin}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          >
            <MomentOfCalm />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          >
            <SelfCareSuggestions 
              energyLevel={energyLevel}
              previousMode={previousMode}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          >
            <ReflectionEntry onSubmit={handleSubmitReflection} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RestoreDashboard;
