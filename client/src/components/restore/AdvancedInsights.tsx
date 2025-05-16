import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const EMOTION_OPTIONS = [
  { value: 'overstimulated', label: '😵‍💫 Overstimulated' },
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'tired', label: '😴 Tired' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'focused', label: '🧠 Focused' },
  { value: 'creative', label: '✨ Creative' },
];

const GROUNDING_STRATEGIES = [
  'Walk',
  'Nap',
  'Music',
  'Meditation',
  'Breathwork',
  'Stretching',
  'Conversation',
  'Quiet time',
];

interface AdvancedInsightsProps {
  values: {
    emotionLabel?: string;
    cognitiveLoad?: number;
    controlRating?: number;
    groundingStrategies: string[];
    clarityGained?: boolean | null;
  };
  onChange: (field: string, value: any) => void;
}

export const AdvancedInsights: React.FC<AdvancedInsightsProps> = ({
  values,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customStrategy, setCustomStrategy] = useState('');

  const toggleStrategy = (strategy: string) => {
    const newStrategies = values.groundingStrategies.includes(strategy)
      ? values.groundingStrategies.filter(s => s !== strategy)
      : [...values.groundingStrategies, strategy];
    onChange('groundingStrategies', newStrategies);
  };

  const addCustomStrategy = () => {
    if (customStrategy.trim() && !values.groundingStrategies.includes(customStrategy)) {
      onChange('groundingStrategies', [...values.groundingStrategies, customStrategy.trim()]);
      setCustomStrategy('');
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden border-border/50">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between text-sm font-medium text-foreground/80 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center">
          <span className="mr-2">🧠</span>
          <span>Advanced Insights</span>
          <span className="ml-2 text-xs text-muted-foreground">
            Optional
          </span>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-6 border-t border-border/50">
              {/* Emotional Label */}
              <div>
                <Label htmlFor="emotionLabel" className="mb-2 block">
                  Emotional Label
                </Label>
                <select
                  id="emotionLabel"
                  value={values.emotionLabel || ''}
                  onChange={(e) => onChange('emotionLabel', e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm border rounded-md bg-background/70 border-border/50 focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select an emotion...</option>
                  {EMOTION_OPTIONS.map((emotion) => (
                    <option key={emotion.value} value={emotion.value}>
                      {emotion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cognitive Load */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="cognitiveLoad">
                    Cognitive Load: {values.cognitiveLoad || 0}/100
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    How mentally taxed do you feel?
                  </span>
                </div>
                <Slider
                  id="cognitiveLoad"
                  min={0}
                  max={100}
                  step={5}
                  value={[values.cognitiveLoad || 0]}
                  onValueChange={([value]) => onChange('cognitiveLoad', value)}
                  className="w-full"
                />
              </div>

              {/* Control Rating */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="controlRating">
                    Sense of Control: {values.controlRating ? `${values.controlRating}/5` : 'Not rated'}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    1 (Low) to 5 (High)
                  </span>
                </div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onChange('controlRating', num)}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        values.controlRating === num
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-background/50 border border-border/30 hover:bg-accent/50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grounding Strategies */}
              <div>
                <Label className="mb-2 block">What helped ground you?</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {GROUNDING_STRATEGIES.map((strategy) => (
                    <button
                      key={strategy}
                      type="button"
                      onClick={() => toggleStrategy(strategy)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        values.groundingStrategies.includes(strategy)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-background/50 border border-border/30 hover:bg-accent/50'
                      }`}
                    >
                      {strategy}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={customStrategy}
                    onChange={(e) => setCustomStrategy(e.target.value)}
                    placeholder="Add your own..."
                    className="flex-1 px-3 py-1.5 text-sm border rounded-md bg-background/70 border-border/50 focus:outline-none focus:ring-1 focus:ring-ring"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomStrategy())}
                  />
                  <button
                    type="button"
                    onClick={addCustomStrategy}
                    disabled={!customStrategy.trim()}
                    className="px-3 py-1.5 text-sm rounded-md bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {values.groundingStrategies.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Selected: {values.groundingStrategies.join(', ')}
                  </div>
                )}
              </div>

              {/* Clarity Gained */}
              <div>
                <Label className="block mb-2">Did you gain clarity from this reflection?</Label>
                <div className="flex space-x-3">
                  {[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                    { value: null, label: 'Unsure' },
                  ].map((option) => (
                    <label key={String(option.value)} className="flex items-center space-x-1.5">
                      <input
                        type="radio"
                        checked={values.clarityGained === option.value}
                        onChange={() => onChange('clarityGained', option.value)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
