import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Plus, Check } from 'lucide-react';
import { Task } from '@/lib/utils';

interface GentleWinsProps {
  completedTasks: Task[];
  onAddWin: (win: string) => void;
}

export const GentleWins: React.FC<GentleWinsProps> = ({
  completedTasks,
  onAddWin,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newWin, setNewWin] = useState('');
  const [wins, setWins] = useState<string[]>([]);

  const handleAddWin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWin.trim()) {
      onAddWin(newWin);
      setWins([...wins, newWin]);
      setNewWin('');
      setIsAdding(false);
    }
  };

  const allWins = [
    ...completedTasks.map((task) => task.title),
    ...wins,
  ];

  if (allWins.length === 0 && !isAdding) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center p-6 rounded-lg bg-background/30 border border-dashed border-border/50"
      >
        <p className="text-muted-foreground mb-4">
          You've done more than you think. Want to log a gentle win manually?
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="mt-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add a Win
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Gentle Wins Today</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="h-8 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      <ul className="space-y-2">
        {allWins.map((win, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-2 text-sm"
          >
            <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
            <span className="text-foreground/90">{win}</span>
          </motion.li>
        ))}
      </ul>

      {isAdding && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleAddWin}
          className="flex gap-2 mt-2"
        >
          <input
            type="text"
            value={newWin}
            onChange={(e) => setNewWin(e.target.value)}
            placeholder="What's one thing you did well today?"
            className="flex-1 px-3 py-1.5 text-sm border rounded-md bg-background/50 border-border/50 focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <Button type="submit" size="sm">
            Add
          </Button>
        </motion.form>
      )}
    </div>
  );
};
