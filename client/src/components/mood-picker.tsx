import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Mood } from "@/lib/utils";
import { useState } from "react";

interface MoodPickerProps {
  selectedMood: Mood;
  energy: number;
  onMoodChange: (mood: Mood) => void;
  onEnergyChange: (energy: number) => void;
}

export function MoodPicker({ 
  selectedMood, 
  energy, 
  onMoodChange, 
  onEnergyChange 
}: MoodPickerProps) {
  const [sliderValue, setSliderValue] = useState([energy]);
  
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    onEnergyChange(value[0]);
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-display mb-3 text-primary">Mood intake</h2>
      <div className="flex gap-2 mb-3">
        <Button
          variant={selectedMood === "stressed" ? "moodActive" : "mood"}
          onClick={() => onMoodChange("stressed")}
        >
          Stressed
        </Button>
        <Button
          variant={selectedMood === "motivated" ? "moodActive" : "mood"}
          onClick={() => onMoodChange("motivated")}
        >
          Motivated
        </Button>
        <Button
          variant={selectedMood === "calm" ? "moodActive" : "mood"}
          onClick={() => onMoodChange("calm")}
        >
          Calm
        </Button>
      </div>
      
      {/* Energy Slider */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-2xl">
          {sliderValue[0] > 70 ? "🔥" : sliderValue[0] > 30 ? "😊" : "😌"}
        </span>
        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-sm text-secondary">Low energy</span>
      </div>
    </div>
  );
}
