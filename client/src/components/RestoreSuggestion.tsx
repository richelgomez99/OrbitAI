import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { RefreshCw } from 'lucide-react';

interface RestoreSuggestionProps {
  text: string;
  icon: string;
  onRefresh?: () => void;
}

export const RestoreSuggestion: React.FC<RestoreSuggestionProps> = ({
  text,
  icon,
  onRefresh,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5" aria-hidden="true">
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm text-foreground/90">{text}</p>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-8 text-xs text-muted-foreground"
              onClick={onRefresh}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Show another
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
