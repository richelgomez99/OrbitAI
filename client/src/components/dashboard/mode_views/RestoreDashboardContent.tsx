import React from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

const RestoreDashboardContent: React.FC = () => {
  const { tasks } = useOrbit(); // setTasks might be needed later for interactions

  // Filter for tasks that could be considered 'gentle wins' - placeholder logic for now
  const gentleWinTasks = tasks.filter(task => task.priority === 'low' && task.status === 'todo').slice(0, 3);
  // Placeholder quote
  const calmingQuote = "The quieter you become, the more you can hear.";

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="p-6 bg-card text-card-foreground">
        <h2 className="text-xl font-semibold mb-3">A Space to Restore</h2>
        <p className="text-muted-foreground mb-4">
          Gently refocus and find your calm. Here are a few small things you can tend to, or simply take a moment to breathe.
        </p>
      </Card>

      {gentleWinTasks.length > 0 && (
        <Card className="p-6 bg-card text-card-foreground">
          <h3 className="text-lg font-medium mb-3">Gentle Wins Today</h3>
          <ul className="space-y-2">
            {gentleWinTasks.map(task => (
              <li key={task.id} className="text-sm text-muted-foreground p-2 border border-border rounded-md">
                {task.title}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 bg-card text-card-foreground">
        <h3 className="text-lg font-medium mb-2">A Moment of Calm</h3>
        <blockquote className="italic text-muted-foreground border-l-2 border-primary pl-3">
          "{calmingQuote}"
        </blockquote>
      </Card>
      
      {/* Placeholder for future elements like journaling prompts or mood tracking */}
      {/* <Card className="p-6 bg-card text-card-foreground">
        <h3 className="text-lg font-medium mb-2">How are you feeling?</h3>
        <p className="text-muted-foreground">[Journaling/Mood logging component here]</p>
      </Card> */}
    </div>
  );
};

export default RestoreDashboardContent;
