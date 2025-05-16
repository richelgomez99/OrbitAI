import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import { useOrbit } from '@/context/orbit-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar'; // Alias to avoid name clash
import { CalendarIcon, X as XIcon, PlusCircle, CheckSquare, Square, Sparkles, ListTree } from 'lucide-react'; // For date picker, remove tag, add tag, subtask icons, AI icons (Sparkles, ListTree - commented out for now)
import { format } from 'date-fns';
import { cn, generateId } from '@/lib/utils'; // Added generateId
import { Task, Priority, Mode } from '@/lib/utils'; // Added Priority, Mode

const TaskDetailModal: React.FC = () => {
  const { 
    showTaskDetailModal, 
    setShowTaskDetailModal, 
    taskForDetailView, 
    setTaskForDetailView, 
    setTaskToEdit,         // Import setTaskToEdit
    setShowAddTaskModal,    // Import setShowAddTaskModal
    updateTask             // Import updateTask
  } = useOrbit();

  const [isEditingView, setIsEditingView] = useState(false);

  // Local state for form fields when editing
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentPriority, setCurrentPriority] = useState<Priority>('medium');
  const [currentDueDate, setCurrentDueDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentEstimatedTime, setCurrentEstimatedTime] = useState<number | undefined>(undefined);
  const [currentTaskMode, setCurrentTaskMode] = useState<Mode | undefined>(undefined);
  const [currentTags, setCurrentTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [currentSubtasks, setCurrentSubtasks] = useState<{ id: string; title: string; done: boolean }[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  // isAiGenerated is not directly editable by user, will be set by AI processes.

  useEffect(() => {
    if (taskForDetailView) {
      // Initialize local form state when taskForDetailView changes or modal opens
      setCurrentTitle(taskForDetailView.title || '');
      setCurrentDescription(taskForDetailView.description || '');
      setCurrentPriority(taskForDetailView.priority || 'medium');
      setCurrentDueDate(taskForDetailView.dueDate ? new Date(taskForDetailView.dueDate) : undefined);
      setCurrentEstimatedTime(taskForDetailView.estimatedTime || undefined);
      setCurrentTaskMode(taskForDetailView.mode || undefined);
      setCurrentTags(taskForDetailView.tags || []);
      setCurrentSubtasks(taskForDetailView.subtasks || []);
      // isAiGenerated is not part of user edit form
      if (!showTaskDetailModal) {
        setIsEditingView(false); // Reset to view mode if modal is re-opened for a new task
      }
    } else {
      // If no task, reset editing mode and clear form fields (though modal shouldn't be open)
      setIsEditingView(false);
      setCurrentTitle('');
      setCurrentDescription('');
      setCurrentPriority('medium');
      setCurrentDueDate(undefined);
      setCurrentEstimatedTime(undefined);
      setCurrentTaskMode(undefined); // Or reset to global mode from context if preferred
      setCurrentTags([]);
      setNewTagInput('');
      setCurrentSubtasks([]);
      setNewSubtaskInput('');
      // isAiGenerated is not part of user edit form
    }
  }, [taskForDetailView, showTaskDetailModal]);

  if (!taskForDetailView && !isEditingView) { // Adjusted condition slightly
    return null; 
  }
  // If !taskForDetailView but isEditingView, it implies modal was closed abruptly; should ideally not happen or be handled by onOpenChange.
  // For safety, if taskForDetailView is null and somehow we are here, we should probably not render or force close.
  if (!taskForDetailView) return null; // Defensively hide if no task for detail view

  const handleClose = () => {
    setShowTaskDetailModal(false);
    // Delay clearing to allow AddTaskModal to pick it up if edit is clicked
    // setTaskForDetailView(null); // We'll clear it in handleEdit or if just closing
  };

  const handleEdit = () => {
    if (taskForDetailView) {
      // Populate form state from taskForDetailView before switching to edit mode
      setCurrentTitle(taskForDetailView.title || '');
      setCurrentDescription(taskForDetailView.description || '');
      setCurrentPriority(taskForDetailView.priority || 'medium');
      setCurrentDueDate(taskForDetailView.dueDate ? new Date(taskForDetailView.dueDate) : undefined);
      setCurrentEstimatedTime(taskForDetailView.estimatedTime || undefined);
      setCurrentTaskMode(taskForDetailView.mode || undefined);
      setCurrentTags(taskForDetailView.tags || []);
      setNewTagInput('');
      setCurrentSubtasks(taskForDetailView.subtasks || []);
      setNewSubtaskInput('');
      // isAiGenerated is not part of user edit form
      setIsEditingView(true);
    }
  };

  const handleSaveChanges = () => {
    if (!taskForDetailView) return;

    // Construct the full updated task object
    const fullUpdatedTask: Task = {
      ...taskForDetailView, // Spread original task to retain all unchanged fields and ID, createdAt etc.
      title: currentTitle,
      description: currentDescription || undefined,
      priority: currentPriority,
      dueDate: currentDueDate,
      estimatedTime: currentEstimatedTime,
      mode: currentTaskMode,
      tags: currentTags.length > 0 ? currentTags : undefined,
      subtasks: currentSubtasks.length > 0 ? currentSubtasks : undefined,
      lastUpdated: new Date(), // Update lastUpdated timestamp
      // isAiGenerated is preserved from original taskForDetailView, not edited here
      // Ensure all fields from Task definition are considered here, matching AddTaskModal,
      // e.g., status, subtasks, tags, mode, estimatedTime etc. if they are editable.
      // For now, only core fields are updated.
    };

    updateTask(fullUpdatedTask); // Call context updateTask with the single Task object
    setIsEditingView(false); // Switch back to view mode
    // taskForDetailView will be updated by the context re-render if the context updates its state correctly
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !currentTags.includes(newTagInput.trim())) {
      setCurrentTags([...currentTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setCurrentTags(currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddSubtask = () => {
    if (newSubtaskInput.trim()) {
      setCurrentSubtasks([...currentSubtasks, { id: generateId(), title: newSubtaskInput.trim(), done: false }]);
      setNewSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (subtaskId: string) => {
    setCurrentSubtasks(currentSubtasks.filter(subtask => subtask.id !== subtaskId));
  };

  const handleToggleSubtask = (subtaskId: string) => {
    setCurrentSubtasks(currentSubtasks.map(subtask => 
      subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
    ));
  };

  const handleCancelEdit = () => {
    // Reset form fields to original taskForDetailView values
    if (taskForDetailView) {
      setCurrentTitle(taskForDetailView.title || '');
      setCurrentDescription(taskForDetailView.description || '');
      setCurrentPriority(taskForDetailView.priority || 'medium');
      setCurrentDueDate(taskForDetailView.dueDate ? new Date(taskForDetailView.dueDate) : undefined);
      setCurrentEstimatedTime(taskForDetailView.estimatedTime || undefined);
      setCurrentTaskMode(taskForDetailView.mode || undefined);
      setCurrentTags(taskForDetailView.tags || []);
      setNewTagInput('');
      setCurrentSubtasks(taskForDetailView.subtasks || []);
      setNewSubtaskInput('');
      // isAiGenerated is not part of user edit form
    }
    setIsEditingView(false);
  };

  const getPriorityBadgeVariant = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  return (
    <Dialog open={showTaskDetailModal} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // If closing via overlay click or X button, ensure taskForDetailView is cleared
        if (showTaskDetailModal) { // only clear if it was open
            setShowTaskDetailModal(false);
            setTaskForDetailView(null); 
        }
      }
    }}>
      <DialogContent className="sm:max-w-[525px]">
        {isEditingView ? (
          // EDITING VIEW - Placeholder for now, will be form fields
          <div className="space-y-4 py-2 pb-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-display font-medium text-center">Edit Task</DialogTitle>
            </DialogHeader>

            {/* Task Title */}
            <div className="space-y-1">
              <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
              <Input
                id="edit-title"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                placeholder="What do you need to do?"
                className="text-lg dark:text-foreground"
              />
            </div>

            {/* Task Description */}
            <div className="space-y-1">
              <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
              <Textarea
                id="edit-description"
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                placeholder="Add details or context (optional)"
                className="resize-none dark:text-foreground"
                rows={3}
              />
            </div>
            
            {/* Priority & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-priority" className="text-sm font-medium">Priority</label>
                <Select value={currentPriority} onValueChange={(value) => setCurrentPriority(value as Priority)}>
                  <SelectTrigger id="edit-priority" className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-due-date" className="text-sm font-medium">Due Date</label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="edit-due-date"
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !currentDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentDueDate ? format(currentDueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={currentDueDate}
                      onSelect={(date) => {
                        setCurrentDueDate(date);
                        setIsCalendarOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {/* Mode & Estimated Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="edit-mode" className="text-sm font-medium">Mode</label>
                <Select value={currentTaskMode || ''} onValueChange={(value) => setCurrentTaskMode(value as Mode)}>
                  <SelectTrigger id="edit-mode" className="w-full">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="build">Build</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="restore">Restore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-estimated-time" className="text-sm font-medium">Est. Time (min)</label>
                <Input
                  id="edit-estimated-time"
                  type="number"
                  value={currentEstimatedTime === undefined ? '' : currentEstimatedTime}
                  onChange={(e) => setCurrentEstimatedTime(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                  placeholder="e.g., 30"
                />
              </div>
            </div>
            {/* Tags */}
            <div className="space-y-1">
              <label htmlFor="edit-tags" className="text-sm font-medium">Tags</label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-tags"
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddTag} aria-label="Add tag">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {currentTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 appearance-none focus:outline-none" aria-label={`Remove ${tag} tag`}>
                        <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {/* Subtasks */}
            <div className="space-y-1">
              <label htmlFor="edit-subtasks" className="text-sm font-medium">Subtasks</label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-subtasks"
                  type="text"
                  value={newSubtaskInput}
                  onChange={(e) => setNewSubtaskInput(e.target.value)}
                  placeholder="Add a subtask"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddSubtask} aria-label="Add subtask">
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              {currentSubtasks.length > 0 && (
                <div className="mt-2 space-y-2">
                  {currentSubtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleSubtask(subtask.id)} aria-label={subtask.done ? 'Mark as not done' : 'Mark as done'}>
                          {subtask.done ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground" />}
                        </button>
                        <span className={cn('flex-1', subtask.done && 'line-through text-muted-foreground')}>{subtask.title}</span>
                      </div>
                      <button onClick={() => handleRemoveSubtask(subtask.id)} className="text-muted-foreground hover:text-destructive" aria-label={`Remove ${subtask.title} subtask`}>
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* AI Actions */}
            <div className="space-y-3 pt-3 border-t border-border/40 mt-4">
              <h4 className="text-sm font-medium text-muted-foreground">AI Actions</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Button variant="outline" size="sm" disabled> {/* TODO: Implement AI Chat Integration */}
                  {/* <Sparkles className="mr-2 h-4 w-4" /> {/* Optional Icon */} 
                  Discuss with AI
                </Button>
                <Button variant="outline" size="sm" disabled> {/* TODO: Implement AI Subtask Generation */}
                  {/* <ListTree className="mr-2 h-4 w-4" /> {/* Optional Icon */} 
                  Generate Subtasks (AI)
                </Button>
              </div>
            </div>
            {/* End AI Actions */}
          </div>
        ) : (
          // READ-ONLY VIEW
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{taskForDetailView.title}</DialogTitle>
              {taskForDetailView.description && (
                <DialogDescription className="pt-2 text-base">
                  {taskForDetailView.description}
                </DialogDescription>
              )}
            </DialogHeader>
            
            <div className="grid gap-3 py-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">Status:</span>
                <Badge variant={taskForDetailView.status === 'done' ? 'default' : 'outline'}>
                  {taskForDetailView.status === 'todo' ? 'To Do' : 'Done'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">Priority:</span>
                <Badge variant={getPriorityBadgeVariant(taskForDetailView.priority)}>
                  {taskForDetailView.priority.toUpperCase()}
                </Badge>
              </div>
              {taskForDetailView.dueDate && (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-600">Due Date:</span>
                  <span>{new Date(taskForDetailView.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {taskForDetailView.estimatedTime !== undefined && (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-600">Est. Time:</span>
                  <span>{taskForDetailView.estimatedTime} min</span>
                </div>
              )}
              {taskForDetailView.tags && taskForDetailView.tags.length > 0 && (
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-gray-600 mt-1">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {taskForDetailView.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {taskForDetailView.subtasks && taskForDetailView.subtasks.length > 0 && (
                <div className="space-y-2">
                  <span className="font-semibold text-gray-600">Subtasks:</span>
                  <ul className="list-none pl-1 space-y-1">
                    {taskForDetailView.subtasks.map(subtask => (
                      <li key={subtask.id} className="flex items-center">
                        {subtask.done ? 
                          <CheckSquare className="h-4 w-4 mr-2 text-green-600" /> : 
                          <Square className="h-4 w-4 mr-2 text-gray-400" />
                        }
                        <span className={cn(subtask.done && 'line-through text-gray-500')}>{subtask.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {taskForDetailView.mode && (
                 <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-600">Mode:</span>
                  {/* Reverted to Badge display for Mode for consistency, can be changed if plain text is preferred */}
                  <Badge variant="secondary">{taskForDetailView.mode.charAt(0).toUpperCase() + taskForDetailView.mode.slice(1)}</Badge>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-600">Created:</span>
                <span>{new Date(taskForDetailView.createdAt).toLocaleDateString()}</span>
              </div>
              {taskForDetailView.lastUpdated && new Date(taskForDetailView.lastUpdated).getTime() !== new Date(taskForDetailView.createdAt).getTime() && (
                 <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-600">Last Updated:</span>
                  <span>{new Date(taskForDetailView.lastUpdated).toLocaleDateString()}</span>
                </div>
              )}
              {taskForDetailView.isAiGenerated && (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-600">Source:</span>
                  <Badge variant="outline">🤖 AI Generated</Badge>
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          {isEditingView ? (
            <>
              <Button onClick={handleSaveChanges} variant="default">Save Changes</Button>
              <Button onClick={handleCancelEdit} variant="outline">Cancel</Button>
            </>
          ) : (
            <>
              <Button onClick={handleEdit} variant="default">Edit</Button>
              <Button onClick={() => {
                setShowTaskDetailModal(false);
                setTaskForDetailView(null);
              }} variant="outline">Close</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
