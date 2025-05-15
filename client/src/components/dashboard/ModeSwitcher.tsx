import React from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Mode, cn, getModeTheme } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Define the order of modes in the switcher
const availableModes: Mode[] = ['build', 'flow', 'restore'];

const ModeSwitcher: React.FC = () => {
  const { mode: activeMode, setMode, showModeSwitcher, setShowModeSwitcher } = useOrbit();

  const handleModeSelect = (selectedMode: Mode) => {
    setMode(selectedMode);
    setShowModeSwitcher(false);
  };

  if (!showModeSwitcher) {
    return null; // Don't render anything if not visible
  }

  return (
    <Dialog open={showModeSwitcher} onOpenChange={setShowModeSwitcher}>
      <DialogContent className="sm:max-w-md rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-50">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center text-neutral-50">Switch Mode</DialogTitle>
          <DialogDescription className="text-center text-neutral-400">
            Select your current operational mode to tailor your OrbitAI experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {availableModes.map((modeValue) => {
            const { label, emoji, description } = getModeTheme(modeValue);
            return (
            <Button
              key={modeValue}
              variant={activeMode === modeValue ? 'default' : 'outline'}
              onClick={() => handleModeSelect(modeValue)}
              className={cn(
                "w-full h-auto flex flex-col items-center justify-center p-4 rounded-lg border text-center transition-all duration-150 ease-in-out",
                activeMode === modeValue
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                  : "text-muted-foreground bg-card hover:bg-accent hover:text-accent-foreground border-border"
              )}
              style={activeMode === modeValue ? { borderColor: `hsl(var(--accent))`, boxShadow: `0 0 15px hsla(var(--accent), 0.5)` } : {}}
            >
              <span className="text-4xl mb-2" role="img" aria-label={label}>{emoji}</span>
              <span className="font-semibold text-sm mb-1">{label}</span>
              <span className="text-xs text-muted-foreground px-1 text-center">{description}</span>
            </Button>
          );})}
        </div>
        <DialogFooter className="sm:justify-center">
          <Button variant="ghost" onClick={() => setShowModeSwitcher(false)} className="text-neutral-400 hover:text-neutral-200">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModeSwitcher;