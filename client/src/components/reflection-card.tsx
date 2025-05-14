import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { FrownIcon, MehIcon, SmileIcon, SmilePlusIcon, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface ReflectionCardProps {
  onSubmit: (mood: number, tags: string[], comment?: string) => void;
}

export function ReflectionCard({ onSubmit }: ReflectionCardProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (selectedMood !== null) {
      onSubmit(selectedMood, selectedTags, comment);
      // Reset form
      setSelectedMood(null);
      setSelectedTags([]);
      setComment("");
    }
  };

  return (
    <Card className="p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-display font-medium text-center mb-6">How did today feel?</h2>
      
      {/* Mood Picker */}
      <div className="flex justify-between mb-6">
        {[
          { value: 1, icon: <FrownIcon className="h-8 w-8" /> },
          { value: 2, icon: <MehIcon className="h-8 w-8" /> },
          { value: 3, icon: <MehIcon className="h-8 w-8" /> },
          { value: 4, icon: <SmileIcon className="h-8 w-8" /> },
          { value: 5, icon: <SmilePlusIcon className="h-8 w-8" /> }
        ].map((mood) => (
          <motion.button
            key={mood.value}
            className={`p-2 rounded-full ${selectedMood === mood.value ? "text-[#9F7AEA]" : "text-gray-500"}`}
            onClick={() => setSelectedMood(mood.value)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mood.icon}
          </motion.button>
        ))}
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Progress", "Blocked", "Breakthrough"].map((tag) => (
          <Button
            key={tag}
            variant={selectedTags.includes(tag) ? "tagActive" : "tag"}
            onClick={() => handleTagToggle(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>
      
      {/* Comment */}
      <div className="mb-6">
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Leave a comment..."
          rows={3}
        />
      </div>
      
      {/* Submit */}
      <Button
        onClick={handleSubmit}
        disabled={selectedMood === null}
        className="w-full py-3 px-6"
      >
        Submit
      </Button>
    </Card>
  );
}
