import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";
import { Priority } from "@/lib/utils";

export default function AddTaskModal() {
  const { showAddTaskModal, setShowAddTaskModal, addTask } = useOrbit();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [subtasks, setSubtasks] = useState<string[]>([
    "Research topic",
    "Write outline",
    "First draft",
    "Proofread"
  ]);

  const handleSave = () => {
    if (title.trim()) {
      addTask({
        title,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        subtasks: subtasks.map(title => ({ id: Math.random().toString(), title, done: false })),
      });
      resetForm();
      setShowAddTaskModal(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setPriority("medium");
    setDueDate("");
  };

  return (
    <Dialog open={showAddTaskModal} onOpenChange={setShowAddTaskModal}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-gray-800 bg-card">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={() => setShowAddTaskModal(false)}>
              <ArrowLeft className="text-secondary h-5 w-5" />
            </Button>
            <DialogTitle className="text-xl font-display font-medium">Add Task</DialogTitle>
            <Button variant="ghost" onClick={handleSave} className="text-[#9F7AEA] font-medium">
              Save
            </Button>
          </div>
        </DialogHeader>
        
        {/* Task Input */}
        <div className="mb-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg"
            placeholder="What do you need to do?"
          />
        </div>
        
        {/* AI Suggestions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary mb-3">AI Suggestions</h3>
          <div className="flex flex-wrap gap-2">
            {subtasks.map((subtask, index) => (
              <motion.div
                key={index}
                className="py-2 px-4 rounded-full bg-surface/80 text-primary border border-[#9F7AEA]/20 flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="w-2 h-2 rounded-full bg-[#9F7AEA]"></span>
                <span>{subtask}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Priority & Deadline */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-secondary mb-3">Priority</h3>
            <div className="flex gap-2">
              <Button
                variant={priority === "low" ? "priorityActive" : "priority"}
                onClick={() => setPriority("low")}
              >
                Low
              </Button>
              <Button
                variant={priority === "high" ? "priorityActive" : "priority"}
                onClick={() => setPriority("high")}
              >
                Urgent
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-secondary mb-3">Deadline</h3>
            <Input 
              type="date" 
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-left"
            />
          </div>
        </div>
        
        {/* Add Button */}
        <div className="flex justify-center">
          <motion.button
            className="w-12 h-12 rounded-full bg-[#9F7AEA] flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(159, 122, 234, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
          >
            <Plus className="text-white h-6 w-6" />
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
