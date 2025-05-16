import React, { useState } from 'react';
import { useReflection } from '@/hooks/useReflection';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { ReflectionEntry } from '../restore/ReflectionEntry';
import { ReflectionHistory } from '../restore/ReflectionHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export const RestoreMode: React.FC = () => {
  const { addReflection, reflections, loading, error } = useReflection();
  const [activeTab, setActiveTab] = useState('new');
  const { toast } = useToast();

  const handleSubmitReflection = async (data: {
    wins: string;
    challenges: string;
    journalEntry: string;
    mood: number;
    energy: number;
    tags: string[];
  }) => {
    try {
      await addReflection({
        ...data,
        mood: data.mood,
        energy: data.energy,
        tags: data.tags,
      });
      
      toast({
        title: 'Reflection saved',
        description: 'Your reflection has been recorded.',
      });
      
      // Switch to history tab after submission
      setActiveTab('history');
    } catch (err) {
      console.error('Error saving reflection:', err);
      toast({
        title: 'Error',
        description: 'Failed to save reflection. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading && !reflections.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">
        Error loading reflections: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Restore Mode</h1>
        <p className="text-muted-foreground">
          Take time to reflect, recharge, and celebrate your progress
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-xs">
          <TabsTrigger value="new">New Reflection</TabsTrigger>
          <TabsTrigger value="history">Past Reflections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="mt-6">
          <div className="p-6 bg-muted/30 rounded-xl">
            <ReflectionEntry onSubmit={handleSubmitReflection} />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <div className="p-6 bg-muted/30 rounded-xl">
            <ReflectionHistory reflections={reflections} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-3">
        <div className="p-6 space-y-4 bg-background rounded-xl border border-border">
          <div className="p-3 rounded-full w-fit bg-green-100 dark:bg-green-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600 dark:text-green-400"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Mindful Breathing</h3>
          <p className="text-sm text-muted-foreground">
            Take a moment to focus on your breath and center yourself.
          </p>
          <Button variant="outline" className="w-full">
            Start Exercise
          </Button>
        </div>

        <div className="p-6 space-y-4 bg-background rounded-xl border border-border">
          <div className="p-3 rounded-full w-fit bg-blue-100 dark:bg-blue-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Guided Meditation</h3>
          <p className="text-sm text-muted-foreground">
            A short guided session to clear your mind and reduce stress.
          </p>
          <Button variant="outline" className="w-full">
            Start Meditation
          </Button>
        </div>

        <div className="p-6 space-y-4 bg-background rounded-xl border border-border">
          <div className="p-3 rounded-full w-fit bg-purple-100 dark:bg-purple-900/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-purple-600 dark:text-purple-400"
            >
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              <path d="M16 12h-6m3-3v6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Quick Break</h3>
          <p className="text-sm text-muted-foreground">
            Step away from your work and recharge with a quick break.
          </p>
          <Button variant="outline" className="w-full">
            Start Break
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestoreMode;
