import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrbit } from '@/context/orbit-context';
import { Task } from '@/lib/utils';
import { GentleWins } from './GentleWins';
import { MomentOfCalm } from './MomentOfCalm';
import { SelfCareSuggestions } from './SelfCareSuggestions';
import { ReflectionEntry } from './ReflectionEntry';
import { ReflectionHistory } from './ReflectionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

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
    emotionLabel?: string;
    cognitiveLoad?: number;
    controlRating?: number;
    groundingStrategies?: string[];
    clarityGained?: boolean | null;
  }) => {
    try {
      // Call addReflection with the required fields
      await addReflection({
        wins: reflection.wins,
        struggles: reflection.struggles,
        journalEntry: reflection.journalEntry,
        // Additional fields can be added here if the context is updated to support them
      });
      
      // Reset form and show success message
      setShowReflectionForm(false);
      setActiveTab('history');
      
      // Show success message (you might want to use a toast here)
      console.log('Reflection submitted successfully');
    } catch (error) {
      console.error('Failed to submit reflection:', error);
      // Handle error (show error message to user)
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Restore Mode</h1>
          <p className="text-muted-foreground">
            Take a moment to reflect and recharge. You've earned it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GentleWins 
            completedTasks={completedTasks} 
            onAddWin={handleAddWin} 
          />
          <MomentOfCalm key="moment-of-calm" energyLevel={energyLevel} />
          <SelfCareSuggestions previousMode={previousMode} />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Reflections</h2>
            <Button 
              onClick={() => {
                setShowReflectionForm(true);
                setActiveTab('new');
              }}
              size="sm"
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              New Reflection
            </Button>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6">
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="mt-0">
              <AnimatePresence mode="wait">
                {showReflectionForm ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2 }}
                  >
                    <ReflectionEntry 
                      onSubmit={async (data) => {
                        await handleSubmitReflection(data);
                      }} 
                      onCancel={() => setShowReflectionForm(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="border-2 border-dashed rounded-lg p-8 text-center"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <h3 className="text-lg font-medium mb-2">Start a new reflection</h3>
                    <p className="text-muted-foreground mb-4">Take a moment to reflect on your day and track your well-being.</p>
                    <Button 
                      onClick={() => setShowReflectionForm(true)}
                      size="lg"
                    >
                      Begin Reflection
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <ScrollArea className="h-[500px] pr-4">
                <ReflectionHistory />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default RestoreDashboard;
