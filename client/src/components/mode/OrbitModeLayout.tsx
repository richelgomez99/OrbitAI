import React from 'react';
import { useOrbitMode } from '@/context/OrbitModeContext';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ModeSwitcher } from './ModeSwitcher';
import { BuildMode } from './modes/BuildMode';
import { FlowMode } from './modes/FlowMode';
import { RestoreMode } from './modes/RestoreMode';

const modeComponents = {
  BUILD: BuildMode,
  FLOW: FlowMode,
  RESTORE: RestoreMode,
} as const;

export const OrbitModeLayout: React.FC = () => {
  const { currentMode } = useOrbitMode();
  const ModeComponent = modeComponents[currentMode];

  return (
    <div className="flex flex-col h-full">
      {/* Mode Switcher */}
      <div className="sticky top-0 z-10 p-4 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto">
          <ModeSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <div className="max-w-4xl p-4 mx-auto">
              <ModeComponent />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Status Bar */}
      <footer className="sticky bottom-0 z-10 p-2 text-xs text-center text-muted-foreground bg-background/80 backdrop-blur-sm border-t border-border/50">
        <div className="max-w-4xl mx-auto">
          <ModeStatusIndicator />
        </div>
      </footer>
    </div>
  );
};

const ModeStatusIndicator: React.FC = () => {
  const { currentMode, modeDurations } = useOrbitMode();
  
  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'BUILD': return 'Build Mode';
      case 'FLOW': return 'Flow Mode';
      case 'RESTORE': return 'Restore Mode';
      default: return '';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="text-left">
        <span className="font-medium">{getModeLabel(currentMode)}</span>
        <span className="mx-2 text-muted-foreground/50">•</span>
        <span className="text-muted-foreground">
          {modeDurations[currentMode] || 0} min today
        </span>
      </div>
      <div className="text-right">
        <span className="text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default OrbitModeLayout;
