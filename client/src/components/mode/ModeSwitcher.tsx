import React from 'react';
import { useOrbitMode, UserMode } from '@/context/OrbitModeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const modeConfig = {
  BUILD: {
    label: 'Build',
    emoji: '⚙️',
    color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    activeColor: 'bg-blue-500/20 border-blue-500/50',
  },
  FLOW: {
    label: 'Flow',
    emoji: '⚡',
    color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400',
    activeColor: 'bg-purple-500/20 border-purple-500/50',
  },
  RESTORE: {
    label: 'Restore',
    emoji: '🌿',
    color: 'bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400',
    activeColor: 'bg-green-500/20 border-green-500/50',
  },
} as const;

export const ModeSwitcher: React.FC = () => {
  const { currentMode, setMode, isTransitioning } = useOrbitMode();

  return (
    <div className="flex items-center justify-center p-2 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
      <div className="relative flex items-center p-1 space-x-1 rounded-lg bg-muted/50">
        <AnimatePresence mode="wait">
          {isTransitioning && (
            <motion.div
              className="absolute inset-0 z-0 bg-background/80 rounded-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-center w-full h-full">
                <div className="w-4 h-4 border-2 border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(Object.entries(modeConfig) as [UserMode, typeof modeConfig[UserMode]][])
          .map(([mode, config]) => ({
            mode,
            ...config,
          }))
          .map(({ mode, label, emoji, color, activeColor }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMode(mode)}
              disabled={isTransitioning}
              className={cn(
                'relative z-10 flex items-center justify-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-foreground/20',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                currentMode === mode
                  ? `${activeColor} shadow-sm border`
                  : `${color} hover:bg-opacity-50`,
                'min-w-[100px]'
              )}
            >
              <span className="mr-2 text-lg">{emoji}</span>
              <span>{label}</span>
              
              <AnimatePresence>
                {currentMode === mode && (
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-current"
                    layoutId="modeIndicator"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </AnimatePresence>
            </button>
          ))}
      </div>
    </div>
  );
};

export default ModeSwitcher;
