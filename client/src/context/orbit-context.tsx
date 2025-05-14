import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Mode, Mood, Task, ReflectionEntry, Message, generateId } from "@/lib/utils";
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
  addTask: (task: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: "todo" | "done" | "snoozed") => void;
  updateTask: (task: Task) => void;
  
  // Reflections
  reflections: ReflectionEntry[];
  addReflection: (reflection: Partial<ReflectionEntry>) => void;
  
  // Chat
  messages: Message[];
  sendMessage: (content: string) => void;
  
  // Focus streak
  focusStreak: boolean[];
}

const OrbitContext = createContext<OrbitContextType | undefined>(undefined);

interface OrbitProviderProps {
  children: ReactNode;
}

export function OrbitProvider({ children }: OrbitProviderProps) {
  // App state
  const [mode, setMode] = useState<Mode>("build");
  const [mood, setMood] = useState<Mood>("motivated");
  const [energy, setEnergy] = useState(60);
  const [started, setStarted] = useState(false);
  
  // Navigation
  const [showAppNavigation, setShowAppNavigation] = useState(false);
  const [, navigate] = useLocation();
  
  // Modals
  const [showModeSwitcher, setShowModeSwitcher] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // Tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Create landing page wireframes",
      description: "Reframe: Break it into homepage, about, and features sections first",
      status: "todo",
      priority: "medium",
      estimatedTime: 45,
      createdAt: new Date()
    },
    {
      id: "2",
      title: "Send proposal to client",
      description: "Reframe: Focus on value proposition instead of feature list",
      status: "todo",
      priority: "high",
      estimatedTime: 20,
      createdAt: new Date()
    }
  ]);
  
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
      try {
        // Fetch tasks
        const tasksResponse = await apiRequest("GET", "/api/tasks", undefined);
        const tasksData = await tasksResponse.json();
        if (tasksData.length) setTasks(tasksData);
        
        // Fetch reflections
        const reflectionsResponse = await apiRequest("GET", "/api/reflections", undefined);
        const reflectionsData = await reflectionsResponse.json();
        if (reflectionsData.length) setReflections(reflectionsData);

      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
  }, []);

  // Start the app and navigate to the flow page
  const startApp = () => {
    setStarted(true);
    navigate("/flow");
  };

  // Add a new task
  const addTask = async (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: generateId(),
      title: taskData.title || "Untitled task",
      description: taskData.description,
      status: "todo",
      priority: taskData.priority || "medium",
      estimatedTime: taskData.estimatedTime,
      dueDate: taskData.dueDate,
      mode: mode,
      subtasks: taskData.subtasks,
      createdAt: new Date()
    };
    
    setTasks(prev => [...prev, newTask]);
    
    try {
      await apiRequest("POST", "/api/tasks", newTask);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      console.error("Error adding task:", error);
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
  const addReflection = async (reflectionData: Partial<ReflectionEntry>) => {
    const newReflection: ReflectionEntry = {
      id: generateId(),
      date: new Date(),
      mood: reflectionData.mood || 3,
      tags: reflectionData.tags || [],
      comment: reflectionData.comment
    };
    
    setReflections(prev => [...prev, newReflection]);
    
    try {
      await apiRequest("POST", "/api/reflections", newReflection);
      queryClient.invalidateQueries({ queryKey: ["/api/reflections"] });
    } catch (error) {
      console.error("Error adding reflection:", error);
    }
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
        await apiRequest("POST", "/api/messages", { 
          content,
          mode,
          mood,
          energy
        });
      } else {
        // Get AI-generated response
        responseContent = await sendMessageToAssistant(content, {
          mode,
          mood,
          energy
        });
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      responseContent = "I'm here to help you maintain momentum. What specific challenge are you facing right now?";
    }
    
    // Add AI response to messages
    const aiMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: responseContent,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  };

  const value = {
    mode,
    setMode,
    mood,
    setMood,
    energy,
    setEnergy,
    started,
    startApp,
    showAppNavigation,
    setShowAppNavigation,
    showModeSwitcher,
    setShowModeSwitcher,
    showAddTaskModal,
    setShowAddTaskModal,
    tasks,
    addTask,
    updateTaskStatus,
    updateTask,
    reflections,
    addReflection,
    messages,
    sendMessage,
    focusStreak
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
