import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from './AuthContext'; // Import useAuth
import { Mode, Mood, Task, ReflectionEntry, Message, generateId, formatDueDate, Priority, getTimeOfDay } from "@/lib/utils";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { getMotivationalQuote, sendMessageToAssistant, type AISuggestion, type AssistantChatResponse } from "@/lib/ai";

interface OrbitContextType {
  // App state
  mode: Mode;
  setMode: (mode: Mode) => void;
  mood: Mood;
  setMood: (mood: Mood) => void;
  energy: number;
  setEnergy: (energy: number) => void;
  started: boolean;
  startApp: () => void;
  
  // Navigation
  showAppNavigation: boolean;
  setShowAppNavigation: (show: boolean) => void;
  
  // Modals
  showModeSwitcher: boolean;
  setShowModeSwitcher: (show: boolean) => void;
  showAddTaskModal: boolean;
  setShowAddTaskModal: (show: boolean) => void;
  initialTaskData: Partial<Task> | null;
  openAddTaskModalWithData: (data: Partial<Task>) => void;
  setInitialTaskData: React.Dispatch<React.SetStateAction<Partial<Task> | null>>;
  
  // Tasks
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>; // Added to allow direct state manipulation if needed
  isLoadingTasks: boolean;
  addTask: (task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: "todo" | "done" | "snoozed") => void;
  updateTask: (task: Task) => void;
  
  // Reflections
  reflections: ReflectionEntry[];
  addReflection: (reflectionData: { wins: string; struggles: string; journalEntry: string; }) => void;
  
  // Chat
  messages: Message[];
  sendMessage: (content: string) => void;
  addAssistantMessage: (messageContent: string) => void; // New function for system-generated assistant messages
  aiSuggestions: AISuggestion[];
  setAiSuggestions: React.Dispatch<React.SetStateAction<AISuggestion[]>>;
  
  // Focus streak
  focusStreak: boolean[];
  recordTaskCompletionForStreak: () => void;
}

const OrbitContext = createContext<OrbitContextType | undefined>(undefined);

interface OrbitProviderProps {
  children: ReactNode;
}

export function OrbitProvider({ children }: OrbitProviderProps) {
  const { user } = useAuth(); // Get user from AuthContext
  // App state
  const [mode, setModeState] = useState<Mode>(() => {
    const storedMode = localStorage.getItem('orbitMode') as Mode;
    const validModes: Mode[] = ['build', 'flow', 'restore'];
    if (storedMode && validModes.includes(storedMode)) {
      return storedMode;
    }
    localStorage.setItem('orbitMode', 'build'); // Correct localStorage if invalid or missing
    return 'build'; // Default to 'build'
  });
  const [mood, setMoodState] = useState<Mood>(() => {
    const storedMood = localStorage.getItem('orbitMood');
    if (storedMood === 'stressed' || storedMood === 'motivated' || storedMood === 'calm') {
      return storedMood as Mood;
    }
    return 'motivated'; // Default if not found or invalid
  });
  const [energy, setEnergyState] = useState<number>(() => {
    const savedEnergy = localStorage.getItem('orbitEnergy');
    return savedEnergy ? parseInt(savedEnergy, 10) : 70;
  });
  const [started, setStarted] = useState(false);
  
  // Navigation
  const [showAppNavigation, setShowAppNavigation] = useState(false);
  const [, navigate] = useLocation();
  
  // Modals
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [initialTaskData, setInitialTaskData] = useState<Partial<Task> | null>(null);
  
  // Tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(true); 
  
  // Reflections
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "Help me prioritize my tasks for the morning",
      timestamp: new Date()
    },
    {
      id: "2",
      role: "assistant",
      content: "Absolutely!",
      timestamp: new Date()
    },
    {
      id: "3",
      role: "assistant",
      content: "What is the most important task you'd like to tackle?",
      timestamp: new Date()
    }
  ]);

  // Focus streak
  const [focusStreak, setFocusStreak] = useState<boolean[]>([true, true, false, false, false, false, false]);

  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const addAssistantMessage = (messageContent: string) => {
    const newAssistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: messageContent,
      timestamp: new Date(),
    };
    setMessages(prevMessages => [...prevMessages, newAssistantMessage]);
  };

  const openAddTaskModalWithData = (data: Partial<Task>) => {
    setInitialTaskData(data);
    setShowAddTaskModal(true);
  };

  // Load initial data from the API
  // Effect for chat_opened trigger
  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/contextual-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trigger: 'chat_opened',
            context: { mode: mode, mood: mood, energyLevel: energy, timeOfDay: getTimeOfDay() },
          }),
        });
        if (response.ok) {
          const assistantMessage = await response.json();
          if (assistantMessage.chatMessage && typeof assistantMessage.chatMessage.content === 'string') {
            // Add this message such that it appears after any initially hardcoded messages
            // For instance, if initial messages are set directly, this will be added after them.
            // If messages are empty initially, this would be the first or among the first.
            addAssistantMessage(assistantMessage.chatMessage.content);
          } else {
            console.warn('addAssistantMessage function not available or message format/content incorrect from /api/contextual-message for chat_opened. Received:', assistantMessage);
          }
        } else {
          console.error('Failed to fetch contextual message for chat_opened:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching contextual message for chat_opened:', error);
      }
    })();
  }, []); // Empty dependency array ensures this runs once on mount

  // Load initial data from the API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTasks(true);
      try {
        // Fetch tasks
        const tasksResponse = await apiRequest("GET", "/api/tasks", undefined);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData); // Always set tasks, even if empty, to reflect backend truth

        // Trigger contextual message if no tasks are loaded
        if (tasksData && tasksData.length === 0) {
          (async () => {
            try {
              const response = await fetch('/api/contextual-message', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  trigger: 'no_task',
                  context: { mode: mode, mood: mood, energyLevel: energy }, // Send current state
                }),
              });
              if (response.ok) {
                const assistantMessage = await response.json();
                if (assistantMessage.chatMessage && typeof assistantMessage.chatMessage.content === 'string') {
                  addAssistantMessage(assistantMessage.chatMessage.content);
                } else {
                  console.warn('addAssistantMessage function not available or message format/content incorrect from /api/contextual-message for no_task. Received:', assistantMessage);
                }
              } else {
                console.error('Failed to fetch contextual message for no_task:', response.statusText);
              }
            } catch (error) {
              console.error('Error fetching contextual message for no_task:', error);
            }
          })();
        }
        
        // Fetch reflections
        const reflectionsResponse = await apiRequest("GET", "/api/reflections", undefined);
        const rawReflectionsData = await reflectionsResponse.json();
        if (rawReflectionsData && rawReflectionsData.length > 0) {
          const transformedReflections = rawReflectionsData.map((apiEntry: any): ReflectionEntry => {
            let mappedMood: Mood | undefined = undefined;
            if (typeof apiEntry.mood === 'number') {
              if (apiEntry.mood === 1 || apiEntry.mood === 2) mappedMood = 'stressed';
              else if (apiEntry.mood === 3) mappedMood = 'calm';
              else if (apiEntry.mood === 4 || apiEntry.mood === 5) mappedMood = 'motivated';
            } else if (typeof apiEntry.mood === 'string' && ['stressed', 'motivated', 'calm'].includes(apiEntry.mood)) {
              mappedMood = apiEntry.mood as Mood;
            }
            return {
              id: apiEntry.id || generateId(),
              userId: apiEntry.userId || user?.id || '', // Ensure userId is present
              date: apiEntry.date ? new Date(apiEntry.date) : new Date(),
              wins: apiEntry.wins || '',
              struggles: apiEntry.struggles || '',
              journalEntry: apiEntry.comment || apiEntry.journalEntry || '',
              mood: mappedMood,
              tags: apiEntry.tags || [],
            };
          }).filter((entry: ReflectionEntry) => entry.userId); // Filter out entries without a userId
          setReflections(transformedReflections);
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
        setTasks([]); // Set to empty on error to clear any stale data
      } finally {
        setIsLoadingTasks(false);
      }
    };

    fetchData();
    startApp(); // Automatically start the app for the session
  }, []); // Empty dependency array ensures this runs once on mount

  // Start the app: navigate to mode selection or dashboard
  const startApp = () => {
    setStarted(true);
    const existingMode = localStorage.getItem('orbitMode');
    if (existingMode) {
      navigate("/dashboard"); // Or another default page like /app or /flow
    } else {
      navigate("/mode-mood-select");
    }
  };

  // Add a new task
  const addTask = async (taskData: Partial<Task>) => {
    if (!user) {
      console.error("User not authenticated. Cannot add task.");
      // TODO: Show user-facing error message
      return;
    }

    const newTask: Task = {
      id: generateId(), // Consider DB-generated IDs in the long run
      user_id: user.id, // Add user_id
      title: taskData.title || "Untitled task",
      description: taskData.description,
      status: "todo",
      priority: taskData.priority || "medium",
      estimatedTime: taskData.estimatedTime,
      dueDate: taskData.dueDate,
      mode: taskData.mode || mode, // Use taskData.mode, fallback to global mode
      subtasks: taskData.subtasks,
      tags: taskData.tags, // Ensure tags are passed
      isAiGenerated: taskData.isAiGenerated || false, // Ensure isAiGenerated is passed
      createdAt: new Date()
    };
    
    const oldTasks = tasks;
    setTasks(prev => [...prev, newTask]); // Optimistic update
    
    try {
      await apiRequest("POST", "/api/tasks", newTask);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      console.error("Error adding task:", error);
      setTasks(oldTasks); // Rollback optimistic update
      // TODO: Show user-facing error message
    }
  };

  // Update a task's status
  const updateTaskStatus = async (id: string, status: "todo" | "done" | "snoozed") => {
    setTasks(prev => 
      prev.map(task => 
        task.id === id ? { ...task, status } : task
      )
    );
    
    try {
      await apiRequest("PATCH", `/api/tasks/${id}`, { status });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      if (status === "done") {
        recordTaskCompletionForStreak();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };
  
  // Update an entire task
  const updateTask = async (updatedTask: Task) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? { ...updatedTask, lastUpdated: new Date() } : task
      )
    );
    
    try {
      // Strip any client-only fields that might not be in the database schema
      const { id, ...taskWithoutId } = updatedTask;
      await apiRequest("PATCH", `/api/tasks/${id}`, { 
        ...taskWithoutId,
        lastUpdated: new Date()
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      console.error("Error updating full task:", error);
    }
  };

  // Add a new reflection
  const addReflection = async (reflectionData: { wins: string; struggles: string; journalEntry: string; }) => {
    if (!user) {
      console.error("User not authenticated. Cannot add reflection.");
      // TODO: Show user-facing error message
      return;
    }

    const newReflection: ReflectionEntry = {
      id: generateId(),
      userId: user.id,
      date: new Date(),
      wins: reflectionData.wins,
      struggles: reflectionData.struggles,
      journalEntry: reflectionData.journalEntry,
      // mood and tags can be added later if captured from UI
    };

    const oldReflections = reflections;
    setReflections(prev => [newReflection, ...prev]); // Optimistic update, add to beginning

    try {
      // TODO: Implement API call to save reflection
      // await apiRequest("POST", "/api/reflections", newReflection);
      // queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
      console.log("Reflection saved locally:", newReflection);

      // Trigger contextual message for reflection_logged
      (async () => {
        try {
          const response = await fetch('/api/contextual-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trigger: 'reflection_logged',
              // No specific context needed for reflection_logged, but API expects context object
              context: { mood: mood, energyLevel: energy }, // Send current mood and energy
            }),
          });
          if (response.ok) {
            const assistantMessage = await response.json();
            if (assistantMessage.chatMessage && typeof assistantMessage.chatMessage.content === 'string') {
              addAssistantMessage(assistantMessage.chatMessage.content);
            } else {
              console.warn('addAssistantMessage function not available or message format/content incorrect from /api/contextual-message for reflection_logged. Received:', assistantMessage);
            }
          } else {
            console.error('Failed to fetch contextual message for reflection_logged:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching contextual message for reflection_logged:', error);
        }
      })();
    } catch (error) {
      console.error("Error adding reflection:", error);
      setReflections(oldReflections); // Rollback optimistic update
      // TODO: Show user-facing error message
    }
  };


  // Record task completion for streak
  const recordTaskCompletionForStreak = () => {
    setFocusStreak(prevStreak => {
      const newStreak = [...prevStreak];
      newStreak[6] = true; // Mark today as active
      // TODO: Implement logic for shifting streak days when a new day starts
      return newStreak;
    });
  };

  // Send a message in the chat
  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    let assistantApiContent: AssistantChatResponse;

    try {
      // Prepare context for the AI
      const assistantContext = {
        mode,
        motivation: mood, // Mapping mood to motivation for AI context
        energy,
        tasks: tasks.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          due: task.dueDate ? formatDueDate(task.dueDate) : null,
          status: task.status,
          estimatedTime: task.estimatedTime,
          tags: task.tags,
        })),
      };

      assistantApiContent = await sendMessageToAssistant(content, assistantContext);
      
      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: assistantApiContent.content,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      setAiSuggestions(assistantApiContent.suggestions || []);

    } catch (error) {
      console.error("Error sending message or getting AI response:", error);
      const errorMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "Sorry, I encountered an issue. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      setAiSuggestions([]); // Clear suggestions on error
    }
  };

  const setModeWithStorage = (newMode: Mode) => {
    localStorage.setItem('orbitMode', newMode);
    setModeState(newMode);
  };

  const setMoodWithStorage = (newMood: Mood) => {
    localStorage.setItem('orbitMood', newMood);
    setMoodState(newMood);
  };

  const setEnergyWithStorage = (newEnergy: number) => {
    const clampedEnergy = Math.max(0, Math.min(100, newEnergy));
    localStorage.setItem('orbitEnergy', clampedEnergy.toString());
    setEnergyState(clampedEnergy);

    // Trigger contextual message if energy is low
    if (clampedEnergy <= 30) {
      (async () => {
        try {
          const response = await fetch('/api/contextual-message', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              trigger: 'energy_low',
              context: {
                energyLevel: clampedEnergy,
                mood: mood // Send current mood as well
              },
            }),
          });
          if (response.ok) {
            const assistantMessage = await response.json();
            if (assistantMessage.chatMessage && typeof assistantMessage.chatMessage.content === 'string') {
              addAssistantMessage(assistantMessage.chatMessage.content);
            } else {
              console.warn('addAssistantMessage function not available or message format/content incorrect from /api/contextual-message for energy_low. Received:', assistantMessage);
            }
          } else {
            console.error('Failed to fetch contextual message for energy_low:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching contextual message for energy_low:', error);
        }
      })();
    }
  };

  const value = {
    mode,
    setMode: setModeWithStorage,
    mood,
    setMood: setMoodWithStorage,
    energy,
    setEnergy: setEnergyWithStorage,
    started,
    startApp,
    showAppNavigation,
    setShowAppNavigation,
    showModeSwitcher,
    setShowModeSwitcher,
    showAddTaskModal,
    setShowAddTaskModal,
    tasks,
    setTasks,
    isLoadingTasks,
    addTask,
    updateTaskStatus,
    updateTask,
    reflections,
    addReflection,
    messages,
    sendMessage,
    addAssistantMessage, // Expose the new function
    aiSuggestions,
    setAiSuggestions,
    focusStreak,
    recordTaskCompletionForStreak,
    initialTaskData,
    openAddTaskModalWithData,
    setInitialTaskData,
  };

  return <OrbitContext.Provider value={value}>{children}</OrbitContext.Provider>;
}

export function useOrbit() {
  const context = useContext(OrbitContext);
  if (context === undefined) {
    throw new Error("useOrbit must be used within an OrbitProvider");
  }
  return context;
}
