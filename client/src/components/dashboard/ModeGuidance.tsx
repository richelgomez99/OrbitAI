import React from 'react';
import { Mode, MODE_CONFIG } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

interface ModeGuidanceProps {
  mode: Mode;
  className?: string;
}

export const ModeGuidance: React.FC<ModeGuidanceProps> = ({ mode, className }) => {
  const config = MODE_CONFIG[mode];
  
  if (!config) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={cn(
        'p-4 rounded-lg border bg-gradient-to-br backdrop-blur-sm',
        config.taskCardClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded-md bg-background/20 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm mb-1.5">
            You're in {config.label} Mode
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {config.description}
          </p>
          <ul className="space-y-2">
            {config.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default ModeGuidance;
