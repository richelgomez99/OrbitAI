import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface FocusStreakTrackerProps {
  streak: boolean[];
  currentDay: number;
}

export function FocusStreakTracker({ streak, currentDay }: FocusStreakTrackerProps) {
  // Get current week starting from Sunday
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  return (
    <Card className="p-4 mb-6">
      <h3 className="text-sm font-medium text-secondary mb-3">Focus Streak Tracker</h3>
      <div className="flex justify-between">
        {days.map((day, index) => (
          <div key={day} className="flex items-center">
            <div className="flex flex-col items-center">
              <span className="text-xs text-secondary mb-1">{day}</span>
              {index < dayOfWeek ? (
                // Past days
                <motion.div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    streak[index] 
                      ? "bg-green-500/20 border border-green-500/30" 
                      : "bg-surface/50 border border-gray-700"
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {streak[index] ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <span className="text-xs text-gray-500">-</span>
                  )}
                </motion.div>
              ) : index === dayOfWeek ? (
                // Current day
                <motion.div 
                  className="w-8 h-8 rounded-full bg-[#9F7AEA]/20 border border-[#9F7AEA]/30 flex items-center justify-center"
                  animate={{ 
                    boxShadow: ["0 0 0 rgba(159, 122, 234, 0)", "0 0 10px rgba(159, 122, 234, 0.5)", "0 0 0 rgba(159, 122, 234, 0)"] 
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2 
                  }}
                >
                  <span className="text-xs font-medium text-[#9F7AEA]">T</span>
                </motion.div>
              ) : (
                // Future days
                <div className="w-8 h-8 rounded-full bg-surface/50 border border-gray-700 flex items-center justify-center">
                  <span className="text-xs text-gray-500">-</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
