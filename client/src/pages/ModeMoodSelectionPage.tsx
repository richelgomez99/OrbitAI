import React, { useState } from 'react';
import { useLocation, Link } from 'wouter'; // Link for navigation
import { useOrbit } from '@/context/orbit-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { cn, Mode } from '@/lib/utils';
import { CloudLightning, Heart, Brain, Waves } from 'lucide-react';

// Define types for mode, mood, and energy if not already globally available
// For now, using string literals directly as in OrbitContext

const ModeMoodSelectionPage: React.FC = () => {
  const { mode, setMode, mood, setMood, energy, setEnergy } = useOrbit();
  const [, navigate] = useLocation(); // Updated to navigate

  // Local state for UI interaction before setting context
  const [selectedMode, setSelectedMode] = useState(mode || 'build'); // Default to 'build'
  const [selectedMood, setSelectedMood] = useState(mood || 'motivated'); // Default to 'motivated'
  const [currentEnergy, setCurrentEnergy] = useState(energy || 70); // Default to 70
  const [journalEntry, setJournalEntry] = useState('');

  const modeIcons: Record<Mode, React.ElementType> = {
    build: CloudLightning,
    restore: Heart,
    flow: Waves,
  };

  const handleModeSelect = (newMode: Mode) => {
    setSelectedMode(newMode);
  };

  const handleMoodSelect = (newMood: 'stressed' | 'motivated' | 'calm') => {
    setSelectedMood(newMood);
  };

  const handleEnergyChange = (value: number[]) => {
    setCurrentEnergy(value[0]);
  };

  const handleBegin = () => {
    setMode(selectedMode as Mode); // Ensure type safety
    setMood(selectedMood as 'stressed' | 'motivated' | 'calm');
    setEnergy(currentEnergy);
    console.log("Journal Entry:", journalEntry); // Log journal entry
    // TODO: Consider passing journalEntry to context if needed by other parts of the app
    navigate('/app'); // Navigate to the main app page or dashboard
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-900 text-neutral-100">
      <Card className="w-full max-w-md bg-neutral-800 border-neutral-700 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {/* Replace with actual Orbit logo component or SVG */}
            <svg viewBox="0 0 100 100" className="w-16 h-16 text-purple-500 fill-current">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="5" fill="none" />
              <circle cx="50" cy="50" r="20" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-white">ORBIT</CardTitle>
          <p className="text-neutral-400">Momentum-first OS for nonlinear builders</p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div>
            <h3 className="text-lg font-semibold mb-3 text-center text-neutral-300">Mode Picker</h3>
            <div className="grid grid-cols-4 gap-3">
              {(['build', 'restore', 'flow'] as Mode[]).map((m) => (
                <Button
                  key={m}
                  variant={selectedMode === m ? 'default' : 'outline'}
                  onClick={() => handleModeSelect(m as Mode)}
                  className={cn(
                    'py-3 text-base flex flex-col items-center justify-center h-24',
                    selectedMode === m 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white border-purple-600'
                      : 'bg-neutral-700 hover:bg-neutral-600 border-neutral-600 text-neutral-300 hover:text-white'
                  )}
                >
                  <>
                    {React.createElement(modeIcons[m], { className: 'w-5 h-5 mb-1 mx-auto' })}
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-center text-neutral-300">Mood Intake</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(['stressed', 'motivated', 'calm'] as const).map((md) => (
                <Button
                  key={md}
                  variant={selectedMood === md ? 'default' : 'outline'}
                  onClick={() => handleMoodSelect(md)}
                  className={cn(
                    'py-3 text-base',
                    selectedMood === md
                      ? 'bg-teal-500 hover:bg-teal-600 text-white border-teal-500'
                      : 'bg-neutral-700 hover:bg-neutral-600 border-neutral-600 text-neutral-300 hover:text-white'
                  )}
                >
                  {md.charAt(0).toUpperCase() + md.slice(1)}
                </Button>
              ))}
            </div>
          </div>
            
          <div>
            <h3 className="text-lg font-semibold mb-3 text-center text-neutral-300">Energy Level</h3>
            <div className="flex items-center gap-3 px-2">
              <span className="text-xl">😌</span>
              <Slider
                defaultValue={[currentEnergy]}
                onValueChange={handleEnergyChange}
                max={100}
                step={1}
                className="flex-1"
                aria-label="Energy level"
              />
              <span className="text-xl">🔥</span>
            </div>
            <p className='text-center text-neutral-400 mt-2'>{currentEnergy}%</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3 text-center text-neutral-300">Quick Thoughts / Journal</h3>
            <Textarea
              placeholder="Optional: Jot down any quick thoughts, goals for this session, or anything on your mind..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="bg-neutral-700 border-neutral-600 text-neutral-200 min-h-[100px] placeholder:text-neutral-400 focus:border-purple-500"
            />
          </div>

          <Button 
            onClick={handleBegin} 
            className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white mt-8"
          >
            Begin
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeMoodSelectionPage;
