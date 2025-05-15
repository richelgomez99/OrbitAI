import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from './AuthContext'; // Import useAuth
import { Mode, Mood, Task, ReflectionEntry, Message, generateId, formatDueDate, Priority } from "@/lib/utils";
import { useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { getMotivationalQuote, sendMessageToAssistant } from "@/lib/ai";

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
    const validModes: Mode[] = ['build', 'recover', 'reflect', 'flow'];
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

  // Load initial data from the API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingTasks(true);
      try {
        // Fetch tasks
        const tasksResponse = await apiRequest("GET", "/api/tasks", undefined);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData); // Always set tasks, even if empty, to reflect backend truth
        
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
      // For now, this just ensures 'today' is marked if a task is done.
      // A more robust solution would involve checking dates.
      return newStreak;
    });
  };

  // Send a message in the chat
  const sendMessage = async (content: string) => {
    // Add user message to state
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Pre-defined responses for common queries
    const aiResponses: Record<string, string> = {
      "Need help deciding?": "Let's break down your options. What choices are you trying to decide between?",
      "Reframe task": "Sometimes changing how we view a task can make it more approachable. What task would you like to reframe?",
      "Clear mental fog": "Let's clear that mental fog. Take a deep breath. What's one small, concrete step you could take right now?"
    };
    
    let responseContent = "";
    
    try {
      if (aiResponses[content]) {
        // Use predefined response for common queries
        responseContent = aiResponses[content];
        
        // Still send to the API for tracking/learning
        // The userMessage is already added outside/before this try-catch for predefined responses.
        // For non-predefined, we add it here if not already added, or ensure it's managed consistently.
        // For simplicity, assuming userMessage is added once before try block as per original structure.

      } else {
        // This is the path for AI-generated responses (not predefined)
        
        // 1. Filter and select relevant tasks
        const relevantTasks = tasks
          .filter(task => task.status === "todo")
          .sort((a, b) => {
            if (a.priority === "high" && b.priority !== "high") return -1;
            if (a.priority !== "high" && b.priority === "high") return 1;
            if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime();
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
          })
          .slice(0, 5); // Max 5 relevant tasks

        // 2. Transform tasks into AssistantTaskContext format
        const assistantTasks = relevantTasks.map(task => {
          const pendingSubtasks = task.subtasks?.filter(st => !st.done) || [];
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            priority: task.priority as string,
            due: task.dueDate ? formatDueDate(task.dueDate) : null,
            status: task.status,
            estimatedTime: task.estimatedTime,
            pendingSubtaskCount: pendingSubtasks.length,
            pendingSubtaskTitles: pendingSubtasks.slice(0, 3).map(st => st.title),
            tags: task.tags,
          };
        });

        // 3. Prepare the full AI context
        const aiContext = {
          mode: mode,
          motivation: mood,
          energy: energy,
          tasks: assistantTasks,
        };

        // 4. Call the AI assistant with rich context
        const aiResponseObject = await sendMessageToAssistant(content, aiContext);
        console.log('AI Response Object:', JSON.stringify(aiResponseObject, null, 2)); // Log the full AI response

        responseContent = aiResponseObject.content; // Default chat message

        // Handle actions from AI, like task updates/reframes
        if (aiResponseObject.action && aiResponseObject.action.type === 'REFRame_TASK' && aiResponseObject.action.taskId) {
          const taskToUpdate = tasks.find(t => t.id === aiResponseObject.action.taskId);
          if (taskToUpdate) {
            let reframeText = "Could not extract reframe text.";
            if (typeof aiResponseObject.action.reframe === 'string') {
              reframeText = aiResponseObject.action.reframe;
            } else if (aiResponseObject.action.reframe && typeof aiResponseObject.action.reframe.suggestion === 'string') {
              reframeText = aiResponseObject.action.reframe.suggestion;
            } else if (aiResponseObject.action.reframe && typeof aiResponseObject.action.reframe.text === 'string') {
              reframeText = aiResponseObject.action.reframe.text;
            }
            const newDescription = `Refram_e_: ${reframeText}`;
            updateTask({ ...taskToUpdate, description: newDescription });
            // Optionally, refine responseContent if the action implies a specific chat message
            // For now, the main 'content' from AI is used for chat.
          }
        }

      }
    } catch (error) {
      console.error("Error sending message or getting AI response:", error);
      responseContent = "I'm here to help you maintain momentum. What specific challenge are you facing right now?";
    }
    
    // Add AI response to messages
    const aiMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: responseContent, // This will be aiResponseObject.content or the error message
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const setMode = (newMode: Mode) => { // Parameter type is Mode
    console.log('Setting mode to:', newMode);
    localStorage.setItem('orbitMode', newMode);
    setModeState(newMode);
  };

  const setMood = (newMood: Mood) => { // Parameter type is Mood, no undefined
    console.log('Setting mood to:', newMood);
    localStorage.setItem('orbitMood', newMood);
    setMoodState(newMood);
  };

  const setEnergy = (newEnergy: number) => {
    const clampedEnergy = Math.max(0, Math.min(100, newEnergy));
    console.log('Setting energy to:', clampedEnergy);
    localStorage.setItem('orbitEnergy', clampedEnergy.toString());
    setEnergyState(clampedEnergy);
  };

  const value = {
    // App state
    mode,
    setMode: setModeState,
    mood,
    setMood: setMoodState,
    energy,
    setEnergy: setEnergyState,
    started,
    startApp,
    // Navigation
    showAppNavigation,
    setShowAppNavigation,
    // Modals
    showModeSwitcher,
    setShowModeSwitcher,
    showAddTaskModal,
    setShowAddTaskModal,
    // Tasks
    tasks,
    setTasks,
    isLoadingTasks,
    addTask,
    updateTaskStatus,
    updateTask,
    // Reflections
    reflections,
    addReflection, // This should now refer to the implemented function
    // Chat
    messages,
    sendMessage,
    // Focus streak
    focusStreak,
    recordTaskCompletionForStreak,
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
