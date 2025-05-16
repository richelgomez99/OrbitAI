import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { selfCareSuggestions, SelfCareSuggestion } from '@/data/restoreData';
import { getTimeOfDay } from '@/lib/utils';

interface SelfCareSuggestionsProps {
  energyLevel?: 'low' | 'medium' | 'high';
  previousMode?: 'build' | 'flow' | 'restore';
}

export const SelfCareSuggestions: React.FC<SelfCareSuggestionsProps> = ({
  energyLevel = 'medium',
  previousMode = 'build',
}) => {
  const [currentSuggestion, setCurrentSuggestion] = useState<SelfCareSuggestion | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getFilteredSuggestions = (): SelfCareSuggestion[] => {
    const timeOfDay = getTimeOfDay();
    
    return selfCareSuggestions.filter(suggestion => {
      const { conditions } = suggestion;
      
      // If no conditions, include the suggestion
      if (Object.keys(conditions).length === 0) return true;
      
      // Check each condition
      return Object.entries(conditions).every(([key, value]) => {
        switch (key) {
          case 'energyLevel':
            return value === energyLevel;
          case 'timeOfDay':
            return value === timeOfDay;
          case 'previousMode':
            return value === previousMode;
          default:
            return true;
        }
      });
    });
  };

  const getRandomSuggestion = (): SelfCareSuggestion | null => {
    const filtered = getFilteredSuggestions();
    if (filtered.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Small delay to show the refresh animation
    setTimeout(() => {
      const newSuggestion = getRandomSuggestion();
      if (newSuggestion) {
        setCurrentSuggestion(newSuggestion);
      }
      setIsRefreshing(false);
    }, 300);
  };

  // Set initial suggestion
  useEffect(() => {
    const suggestion = getRandomSuggestion();
    setCurrentSuggestion(suggestion);
  }, [energyLevel, previousMode]);

  if (!currentSuggestion) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5" aria-hidden="true">
          {currentSuggestion.icon}
        </span>
        <div className="flex-1">
          <p className="text-sm text-foreground/90">{currentSuggestion.text}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mt-2 h-8 text-xs text-muted-foreground"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Thinking...' : 'Suggest something else'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
