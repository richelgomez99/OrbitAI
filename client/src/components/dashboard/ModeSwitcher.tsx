import React, { useEffect, useState } from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Mode, ModeConfig, cn, getModeTheme, MODE_CONFIG } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Zap, Waves, Leaf } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const MODE_ICONS = {
  build: <Zap className="w-5 h-5 text-orange-500" />,
  flow: <Waves className="w-5 h-5 text-blue-500" />,
  restore: <Leaf className="w-5 h-5 text-green-500" />,
} as const;

const ModeSwitcher: React.FC = () => {
  const { mode: activeMode, setMode, showModeSwitcher, setShowModeSwitcher, addAssistantMessage } = useOrbit();
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Reset selection when dialog is opened/closed
  useEffect(() => {
    if (showModeSwitcher) {
      setSelectedMode(null);
    }
  }, [showModeSwitcher]);

  const handleModeSelect = (mode: Mode) => {
    setSelectedMode(mode);
  };

  const confirmModeSelection = async () => {
    if (!selectedMode) return;
    
    setIsTransitioning(true);
    
    // Add a small delay for the transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setMode(selectedMode);
    setShowModeSwitcher(false);
    setIsTransitioning(false);

    // Trigger contextual message
    try {
      const response = await fetch('/api/contextual-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 'v1',
          trigger: 'mode_change',
          context: { mode: selectedMode }
        }),
      });
      
      if (response.ok) {
        const { chatMessage } = await response.json();
        if (addAssistantMessage && chatMessage?.content) {
          addAssistantMessage(chatMessage.content);
        }
      }
    } catch (error) {
      console.error('Error triggering contextual message:', error);
    }
  };

  if (!showModeSwitcher) return null;

  const renderModeSelection = () => (
    <AnimatePresence mode="wait">
      <motion.div
        key="mode-selection"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Select Your Focus</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose how you want to work right now
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3">
          {(Object.entries(MODE_CONFIG) as [Mode, ModeConfig][]).map(([mode, config]) => (
            <Button
              key={mode}
              variant={selectedMode === mode ? 'default' : 'outline'}
              onClick={() => handleModeSelect(mode)}
              className={cn(
                'h-auto p-4 justify-between group transition-all duration-200',
                selectedMode === mode && 'ring-2 ring-offset-2 ring-offset-background',
                `hover:border-${mode}-400/50`
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  selectedMode === mode 
                    ? 'bg-background/20' 
                    : 'bg-muted/50 group-hover:bg-muted/70'
                )}>
                  {MODE_ICONS[mode]}
                </div>
                <div className="text-left">
                  <div className="font-medium">{config.label}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
              </div>
              <ChevronRight className={cn(
                'w-5 h-5 transition-transform duration-200',
                selectedMode === mode ? 'scale-125' : 'opacity-0 group-hover:opacity-100'
              )} />
            </Button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );

  const renderModeConfirmation = () => {
    if (!selectedMode) return null;
    const config = MODE_CONFIG[selectedMode];
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="mode-confirmation"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <div className="text-2xl">{config.emoji}</div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Switch to {config.label} Mode?
            </DialogTitle>
            <DialogDescription className="text-center">
              {config.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Quick tips:</span>
              <ul className="mt-2 space-y-2">
                {config.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <Dialog open={showModeSwitcher} onOpenChange={setShowModeSwitcher}>
      <DialogContent className={cn(
        'sm:max-w-md border-0 p-0 overflow-hidden',
        {
          'bg-gradient-to-b from-purple-950/80 to-background': selectedMode === 'build',
          'bg-gradient-to-b from-sky-950/80 to-background': selectedMode === 'flow',
          'bg-gradient-to-b from-violet-950/80 to-background': selectedMode === 'restore',
          'bg-background': !selectedMode,
        }
      )}>
        <div className="p-6">
          {!selectedMode ? renderModeSelection() : renderModeConfirmation()}
        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-gradient-to-r from-background/80 via-background/50 to-background/80">
          {!selectedMode ? (
            <Button 
              variant="outline" 
              onClick={() => setShowModeSwitcher(false)}
              className="w-full"
            >
              Cancel
            </Button>
          ) : (
            <div className="flex w-full gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedMode(null)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={confirmModeSelection}
                className="flex-1 gap-2"
                disabled={isTransitioning}
              >
                {isTransitioning ? (
                  'Switching...'
                ) : (
                  <>
                    <span>Switch to {selectedMode}</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModeSwitcher;