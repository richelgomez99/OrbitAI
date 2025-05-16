import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Save, Loader2 } from 'lucide-react';
import { Mood } from '@/lib/utils';

interface ReflectionEntryProps {
  onSubmit: (reflection: {
    wins: string;
    struggles: string;
    mood: Mood;
    journalEntry: string;
  }) => Promise<void>;
}

export const ReflectionEntry: React.FC<ReflectionEntryProps> = ({ onSubmit }) => {
  const [wins, setWins] = useState('');
  const [struggles, setStruggles] = useState('');
  const [mood, setMood] = useState<Mood>('neutral');
  const [journalEntry, setJournalEntry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const moodOptions: { value: Mood; label: string; emoji: string }[] = [
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😔' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'energized', label: 'Energized', emoji: '⚡' },
    { value: 'tired', label: 'Tired', emoji: '😴' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wins.trim() || !struggles.trim()) {
      return; // Basic validation
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        wins,
        struggles,
        mood,
        journalEntry: journalEntry.trim() || 'No journal entry',
      });
      
      setIsSubmitted(true);
      // Reset form after successful submission
      setTimeout(() => {
        setWins('');
        setStruggles('');
        setMood('neutral');
        setJournalEntry('');
        setIsSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-6 rounded-lg bg-background/50 border border-border/50"
      >
        <div className="text-4xl mb-3">✨</div>
        <h3 className="font-medium mb-1">Reflection Saved</h3>
        <p className="text-muted-foreground text-sm">
          Thanks for checking in with yourself.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50"
    >
      <div>
        <label htmlFor="wins" className="block text-sm font-medium mb-1">
          Today's Wins
        </label>
        <textarea
          id="wins"
          value={wins}
          onChange={(e) => setWins(e.target.value)}
          placeholder="What went well today?"
          className="w-full px-3 py-2 text-sm border rounded-md bg-background/70 border-border/50 focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="struggles" className="block text-sm font-medium mb-1">
          Challenges Faced
        </label>
        <textarea
          id="struggles"
          value={struggles}
          onChange={(e) => setStruggles(e.target.value)}
          placeholder="What was challenging today?"
          className="w-full px-3 py-2 text-sm border rounded-md bg-background/70 border-border/50 focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Current Mood
        </label>
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setMood(option.value)}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-md text-sm transition-colors ${
                mood === option.value
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-background/50 border border-border/30 hover:bg-accent/50'
              }`}
              disabled={isSubmitting}
            >
              <span className="text-xl mb-1">{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="journal" className="block text-sm font-medium mb-1">
          Journal (Optional)
        </label>
        <textarea
          id="journal"
          value={journalEntry}
          onChange={(e) => setJournalEntry(e.target.value)}
          placeholder="Any other thoughts or reflections?"
          className="w-full px-3 py-2 text-sm border rounded-md bg-background/70 border-border/50 focus:outline-none focus:ring-1 focus:ring-ring min-h-[100px]"
          disabled={isSubmitting}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !wins.trim() || !struggles.trim()}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Reflection
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
};
