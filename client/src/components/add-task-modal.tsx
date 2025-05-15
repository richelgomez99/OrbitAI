import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, Tag, CalendarClock, Clock, XCircle } from "lucide-react";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";
import { Priority, Mode } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateSubtasks } from "@/lib/ai";
import { apiRequest } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddTaskModal() {
  const { showAddTaskModal, setShowAddTaskModal, addTask, mode, initialTaskData, setInitialTaskData } = useOrbit();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<number | undefined>(undefined);
  const [taskMode, setTaskMode] = useState<Mode | undefined>(mode);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [subtasks, setSubtasks] = useState<{id: string; title: string; done: boolean}[]>([]);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState("");
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  useEffect(() => {
    if (showAddTaskModal && initialTaskData) {
      setTitle(initialTaskData.title || "");
      setDescription(initialTaskData.description || "");
      setPriority(initialTaskData.priority || "medium");
      setSelectedDate(initialTaskData.dueDate || undefined);
      setEstimatedTime(initialTaskData.estimatedTime || undefined);
      setTaskMode(initialTaskData.mode || mode); // Default to global mode if not specified
      setTags(initialTaskData.tags || []);
      setSubtasks(initialTaskData.subtasks || []); // Pre-fill subtasks
      setIsAiGenerated(initialTaskData.isAiGenerated || false);
    }
    // Clearing of initialTaskData and form reset is handled by 
    // handleOpenChange when the dialog closes, and by handleSave.
  }, [showAddTaskModal, initialTaskData, mode]);

  // Generate AI subtasks when task title changes
  const generateAiSubtasks = async () => {
    if (!title.trim()) return;
    
    setIsGeneratingSubtasks(true);
    try {
      const suggestions = await generateSubtasks(title);
      if (suggestions && suggestions.length) {
        const newSubtasks = suggestions.map(subtaskTitle => ({ 
          id: Math.random().toString(36).substring(2, 9),
          title: subtaskTitle,
          done: false
        }));
        setSubtasks(newSubtasks);
      }
    } catch (error) {
      console.error("Error generating subtasks:", error);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const handleSave = () => {
    if (title.trim()) {
      addTask({
        title,
        description: description || undefined,
        priority,
        dueDate: selectedDate,
        estimatedTime,
        mode: taskMode,
        tags: tags.length > 0 ? tags : undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined,
        isAiGenerated: isAiGenerated,
      });
      setInitialTaskData(null); // Clear initial data after saving
      resetForm();
      setShowAddTaskModal(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setSelectedDate(undefined);
    setEstimatedTime(undefined);
    setTaskMode(mode);
    setTags([]);
    setNewTag("");
    setSubtasks([]);
    setNewSubtask("");
    setIsAiGenerated(false);
    // setInitialTaskData(null); // Clearing here as well to be safe, though onOpenChange / save should handle it.
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks, 
        {
          id: Math.random().toString(36).substring(2, 9),
          title: newSubtask.trim(),
          done: false
        }
      ]);
      setNewSubtask("");
    }
  };
  
  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleOpenChange = (isOpen: boolean) => {
    setShowAddTaskModal(isOpen);
    if (!isOpen) {
      resetForm(); // Resets form state and clears initialTaskData implicitly via resetForm's logic
      setInitialTaskData(null); // Explicitly clear here too for safety
    }
  };

  return (
    <Dialog open={showAddTaskModal} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-gray-800 bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="icon" onClick={() => setShowAddTaskModal(false)}>
              <ArrowLeft className="text-gray-400 h-5 w-5" />
            </Button>
            <DialogTitle className="text-xl font-display font-medium">Add Task</DialogTitle>
            <Button variant="ghost" onClick={handleSave} className="text-[#9F7AEA] font-medium">
              Save
            </Button>
          </div>
        </DialogHeader>
        
        {/* Task Title */}
        <div className="mb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg text-primary"
            placeholder="What do you need to do?"
            onBlur={() => {
              // Only auto-generate if title is present, no subtasks yet, AND task is NOT from AI chat suggestion
              if (title.trim() && subtasks.length === 0 && !isAiGenerated) {
                generateAiSubtasks();
              }
            }}
          />
        </div>
        
        {/* Task Description */}
        <div className="mb-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details or context (optional)"
            className="resize-none text-primary"
            rows={3}
          />
        </div>
        
        {/* Priority & Mode & Time Estimate */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-2">Priority</h3>
            <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-2">Mode</h3>
            <Select value={taskMode} onValueChange={(value) => setTaskMode(value as Mode)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="build">Build</SelectItem>
                <SelectItem value="flow">Flow</SelectItem>
                <SelectItem value="restore">Restore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-400 mb-2">Est. Time (min)</h3>
            <Input
              type="number"
              min="5"
              step="5"
              value={estimatedTime || ''}
              onChange={(e) => setEstimatedTime(parseInt(e.target.value) || undefined)}
              className="w-full text-primary"
            />
          </div>
        </div>
        
        {/* Due Date */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-400 mb-2">Due Date</h3>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setIsCalendarOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Tags */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-400 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="ml-1 rounded-full hover:bg-muted p-1"
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              className="flex-1 text-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={addTag}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Subtasks Section */}
        {isAiGenerated && title.trim() && (
          <div className="my-4 flex justify-center">
            <Button 
              variant="outline"
              size="sm"
              onClick={generateAiSubtasks} 
              disabled={isGeneratingSubtasks || !title.trim()}
              className="border-purple-500 text-purple-500 hover:bg-purple-500/10 hover:text-purple-600"
            >
              {isGeneratingSubtasks ? "Thinking..." : " Break down further with AI?"}
            </Button>
          </div>
        )}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xs font-medium text-gray-400">Subtasks</h3>
            <Button 
              variant="link" 
              size="sm" 
              onClick={generateAiSubtasks}
              disabled={!title.trim() || isGeneratingSubtasks}
            >
              Generate with AI
            </Button>
          </div>
          
          {isGeneratingSubtasks ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#9F7AEA] border-r-2 border-b-2 border-gray-800"></div>
              <span className="ml-2 text-sm text-gray-400">Generating...</span>
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-2">
                {subtasks.map((subtask, index) => (
                  <motion.div
                    key={subtask.id}
                    className="py-2 px-4 rounded-lg bg-surface/80 text-primary border border-[#9F7AEA]/20 flex items-center gap-2 justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#9F7AEA]"></span>
                      <span className="text-sm">{subtask.title}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeSubtask(subtask.id)}
                      className="rounded-full hover:bg-muted p-1"
                    >
                      <XCircle className="h-4 w-4 text-gray-400" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSubtask();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addSubtask}
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subtask
                </Button>
              </div>
            </>
          )}
        </div>
        
        {/* Save Button */}
        <div className="flex justify-center">
          <motion.button
            className="w-12 h-12 rounded-full bg-[#9F7AEA] flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(159, 122, 234, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={!title.trim()}
          >
            <Plus className="text-white h-6 w-6" />
          </motion.button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
