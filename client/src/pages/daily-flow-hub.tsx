import { useOrbit } from "@/context/orbit-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TaskCard } from "@/components/task-card";
import { FocusStreakTracker } from "@/components/focus-streak-tracker";
import { Info, CircleArrowOutDownLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getRandomQuote, Mode } from "@/lib/utils";

export default function DailyFlowHub() {
  const { 
    mode,
    mood, 
    energy, 
    setEnergy, 
    tasks, 
    updateTaskStatus, 
    setShowModeSwitcher,
    focusStreak
  } = useOrbit();
  
  const [sliderValue, setSliderValue] = useState([energy]);
  const [quote, setQuote] = useState(getRandomQuote());
  
  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);
  
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setEnergy(value[0]);
  };
  
  const modeColors: Record<Mode, string> = {
    build: "border-[#9F7AEA]/30 text-[#9F7AEA]", // Purple
    restore: "border-[#FC8181]/30 text-[#FC8181]", // Red
    flow: "border-green-500/30 text-green-400" // Green
  };
  
  const modeIcons: Record<Mode, string> = {
    build: "⚡",
    restore: "❤️‍🩹",
    flow: "🌊"
  };
  
  const energyLevel = 
    sliderValue[0] < 30 ? "Low" : 
    sliderValue[0] < 70 ? "Medium" : 
    "High";

  return (
    <div className="page-transition animate-fade-in pb-24 pt-8 px-4">
      {/* Mode Badge */}
      <motion.div 
        className="mb-6 flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={`glass px-4 py-2 rounded-full flex items-center gap-2 border ${modeColors[mode as Mode]}`}>
          <span className={modeColors[mode as Mode]}>{modeIcons[mode as Mode]}</span>
          <span className="text-primary">You're in {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode</span>
          <Info className="text-secondary cursor-pointer ml-1 h-4 w-4" />
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="bg-surface/50 p-2 rounded-full"
          onClick={() => setShowModeSwitcher(true)}
        >
          <CircleArrowOutDownLeft className="text-secondary h-4 w-4" />
        </Button>
      </motion.div>
      
      {/* Energy Level */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-secondary">Energy Level</h3>
            <span className="text-sm text-secondary">{energyLevel}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl">😌</span>
            <Slider
              value={sliderValue}
              onValueChange={handleSliderChange}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xl">🔥</span>
          </div>
        </Card>
      </motion.div>
      
      {/* Task Sections: Focus and Upcoming */}
      {(() => {
        const todoTasks = tasks.filter(task => task.status === "todo");
        const focusTask = todoTasks.length > 0 ? todoTasks[0] : null;
        const upcomingTasks = todoTasks.length > 1 ? todoTasks.slice(1) : [];

        return (
          <>
            {/* Current Focus Task Section */}
            {focusTask && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className={`text-2xl font-display font-semibold mb-3 ${modeColors.flow.split(' ')[1]}`}>Current Focus</h2>
                <TaskCard
                  key={focusTask.id}
                  task={focusTask}
                  onStatusChange={updateTaskStatus}
                />
              </motion.div>
            )}

            {/* Upcoming Tasks Section */}
            {upcomingTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: focusTask ? 0.4 : 0.3 }} // Adjust delay if focus task exists
              >
                <h3 className="text-xl font-display font-medium mb-3 text-primary">Up Next</h3>
                {upcomingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={updateTaskStatus}
                  />
                ))}
              </motion.div>
            )}

            {/* No Tasks Message */}
            {!focusTask && upcomingTasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 text-center mb-4 mt-6 border-dashed border-gray-700">
                  <p className="text-secondary">Your task feed is clear! Add a new task to get into the flow.</p>
                </Card>
              </motion.div>
            )}
          </>
        );
      })()}
      
      {/* Focus Streak Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <FocusStreakTracker 
          streak={focusStreak} 
          currentDay={new Date().getDay()} 
        />
      </motion.div>
      
      {/* Focus Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-5 mb-6">
          <p className="text-primary text-center font-medium italic">{quote}</p>
          <p className="text-secondary text-center mt-2 text-sm">— AI Insight</p>
        </Card>
      </motion.div>
    </div>
  );
}
