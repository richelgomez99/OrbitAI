import React, { useState, useMemo } from 'react';
import { useOrbit } from '@/context/orbit-context';
import { Task, TaskStatus } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';
import { FiList, FiGrid, FiFilter, FiChevronDown, FiPlus } from 'react-icons/fi';

// Define Mode enum locally since we can't import it from utils
enum Mode {
  BUILD = 'build',
  FLOW = 'flow',
  RESTORE = 'restore'
}

// Types
type ViewMode = 'list' | 'kanban';
type SortOption = 'priority' | 'dueDate' | 'createdAt' | 'title';

const TasksPage: React.FC = () => {
  const { tasks, isLoadingTasks, updateTaskStatus, mode } = useOrbit();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Log tasks when they change
  React.useEffect(() => {
    console.log('Tasks loaded:', tasks);
    console.log('Tasks length:', tasks.length);
  }, [tasks]);

  // Process tasks based on filters and sorting
  const processedTasks = useMemo(() => {
    console.log('Processing tasks:', tasks);
    let result = [...tasks];
    
    // Apply filters
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    if (modeFilter !== 'all') {
      result = result.filter(task => task.mode === modeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        }
        case 'dueDate':
          return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    return result;
  }, [tasks, statusFilter, modeFilter, sortBy]);

  // Group tasks by status for Kanban view
  const kanbanTasks = useMemo(() => {
    const groups: { [key in TaskStatus]: Task[] } = {
      todo: [],
      inprogress: [],
      done: [],
      blocked: [],
      pending: []
    };
    
    processedTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      } else {
        // For any unexpected status, add to todo as a fallback
        groups['todo'].push(task);
      }
    });
    
    return groups;
  }, [processedTasks]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    // Map the status to match backend expectations
    const statusMap: {[key: string]: TaskStatus} = {
      'inProgress': 'inprogress',
      'inprogress': 'inprogress',
      'todo': 'todo',
      'done': 'done',
      'blocked': 'blocked',
      'pending': 'pending',
      'snoozed': 'pending' as const // Map snoozed to pending for now
    };
    
    const newStatus = statusMap[result.destination.droppableId] || 'todo';
    updateTaskStatus(taskId, newStatus);
  };

  if (isLoadingTasks) {
    return (
      <div className="p-8 text-center text-neutral-400">
        <div className="animate-pulse space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'todo', label: 'To Do' },
    { value: 'inprogress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'pending', label: 'Pending' }
  ];

  const modeOptions = [
    { value: 'all', label: 'All Modes' },
    ...Object.entries(Mode).map(([key, value]) => {
      const modeValue = value as string;
      return {
        value: modeValue,
        label: modeValue.charAt(0).toUpperCase() + modeValue.slice(1)
      };
    })
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'createdAt', label: 'Recently Added' },
    { value: 'title', label: 'Title' }
  ];

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div 
      className={`bg-neutral-800 p-4 rounded-lg shadow-lg border-l-4 ${
        task.priority === 'high' ? 'border-red-500' : 
        task.priority === 'medium' ? 'border-yellow-500' : 
        'border-green-500'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-100 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-neutral-400 mt-1 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {task.mode && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-900/50 text-sky-300">
                {task.mode}
              </span>
            )}
            {task.estimatedTime && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300">
                {task.estimatedTime} min
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end ml-2">
          <select 
            value={task.status}
            onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
            className="text-xs p-1 rounded bg-neutral-700 border border-neutral-600 text-neutral-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            onClick={(e) => e.stopPropagation()}
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
            <option value="pending">Pending</option>
          </select>
          
          {task.dueDate && (
            <span className="text-xs text-neutral-500 mt-1">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-2 border-t border-neutral-700/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-neutral-400">Subtasks</span>
            <span className="text-xs text-neutral-500">
              {task.subtasks.filter(st => st.done).length}/{task.subtasks.length}
            </span>
          </div>
          <div className="w-full bg-neutral-700/50 rounded-full h-1.5">
            <div 
              className="bg-purple-500 h-1.5 rounded-full" 
              style={{
                width: `${(task.subtasks.filter(st => st.done).length / task.subtasks.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 bg-neutral-900 min-h-screen text-white">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Tasks
            </h1>
            <p className="text-neutral-400 mt-1">
              {processedTasks.length} {processedTasks.length === 1 ? 'task' : 'tasks'} found
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'kanban' : 'list')}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              title={viewMode === 'list' ? 'Switch to Kanban view' : 'Switch to List view'}
            >
              {viewMode === 'list' ? <FiGrid size={20} /> : <FiList size={20} />}
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
              >
                <FiFilter size={16} />
                <span className="hidden sm:inline">Filter</span>
                <FiChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-lg shadow-xl z-10 p-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 text-sm rounded-md bg-neutral-700 border border-neutral-600 text-neutral-200"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Mode</label>
                    <select 
                      value={modeFilter}
                      onChange={(e) => setModeFilter(e.target.value)}
                      className="w-full p-2 text-sm rounded-md bg-neutral-700 border border-neutral-600 text-neutral-200"
                    >
                      {modeOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Sort By</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="w-full p-2 text-sm rounded-md bg-neutral-700 border border-neutral-600 text-neutral-200"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <button className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 transition-opacity">
              <FiPlus size={16} />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </header>

      {processedTasks.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-neutral-700 rounded-xl">
          <div className="mx-auto w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <FiList size={32} className="text-neutral-500" />
          </div>
          <h3 className="text-lg font-medium text-neutral-200">No tasks found</h3>
          <p className="mt-1 text-neutral-400 max-w-md mx-auto">
            {statusFilter !== 'all' || modeFilter !== 'all' 
              ? 'Try adjusting your filters or create a new task.'
              : 'You have no tasks yet. Create your first task to get started.'}
          </p>
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
            <FiPlus className="mr-2" />
            Add Task
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {processedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(kanbanTasks).map(([status, tasks]) => (
              <div key={status} className="space-y-3">
                <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                  {statusOptions.find(o => o.value === status)?.label || status}
                  <span className="ml-2 text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </h2>
                <Droppable droppableId={status}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className={`min-h-[100px] p-2 rounded-lg ${
                        status === 'todo' ? 'bg-neutral-800/50' : 
                        status === 'inprogress' ? 'bg-blue-900/20' :
                        status === 'done' ? 'bg-green-900/20' :
                        status === 'blocked' ? 'bg-red-900/20' :
                        'bg-amber-900/20'
                      }`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {tasks.length === 0 && (
                        <div className="text-center py-4 text-sm text-neutral-500">
                          No tasks in this column
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default TasksPage;
