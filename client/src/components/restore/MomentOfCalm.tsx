import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import { calmQuotes } from '@/data/restoreData';

interface MomentOfCalmProps {
  energyLevel?: 'low' | 'medium' | 'high';
}

export const MomentOfCalm: React.FC<MomentOfCalmProps> = ({ energyLevel = 'medium' }) => {
  const [currentQuote, setCurrentQuote] = useState(calmQuotes[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * calmQuotes.length);
    return calmQuotes[randomIndex];
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Small delay to show the refresh animation
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 300);
  };

  // Rotate quotes every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote(getRandomQuote());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50"
    >
      <div className="flex flex-col items-center text-center">
        <span className="text-4xl mb-4" aria-hidden="true">
          {currentQuote.tone === 'Stillness' ? '🧘' : 
           currentQuote.tone === 'Reset' ? '🔄' :
           currentQuote.tone === 'Renewal' ? '🌱' :
           currentQuote.tone === 'Trust' ? '🤲' : '✨'}
        </span>
        
        <blockquote className="space-y-4">
          <motion.p 
            key={currentQuote.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.3 }
            }}
            className="text-lg font-medium text-foreground/90 italic"
          >
            "{currentQuote.text}"
          </motion.p>
          <motion.footer 
            key={`${currentQuote.author}-footer`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground"
          >
            — {currentQuote.author}
          </motion.footer>
        </blockquote>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="mt-4 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Show another'}
        </Button>
      </div>
    </motion.div>
  );
};
