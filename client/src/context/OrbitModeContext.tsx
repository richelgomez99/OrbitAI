import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from './UserContext';
import { trpc } from '@/lib/trpc';

export type UserMode = 'BUILD' | 'FLOW' | 'RESTORE';

export interface ModeSession {
  id: string;
  mode: UserMode;
  startTime: Date;
  endTime: Date | null;
  energyStart: number;
  energyEnd: number | null;
  taskId?: string | null;
  task?: {
    id: string;
    title: string;
    description: string | null;
  } | null;
}

export interface ModeContextType {
  // Current state
  currentMode: UserMode;
  isTransitioning: boolean;
  activeSession: ModeSession | null;
  modeDurations: Record<UserMode, number>; // in minutes
  currentStreak: number;
  
  // Actions
  setMode: (mode: UserMode) => Promise<void>;
  startSession: (mode: UserMode, energyLevel?: number, taskId?: string) => Promise<ModeSession>;
  endSession: (energyLevel?: number) => Promise<void>;
  getSessionDuration: () => number;
  
  // Derived state
  isInSession: boolean;
  currentSessionDuration: number; // in minutes
  
  // Loading states
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const defaultModeContext: ModeContextType = {
  // State
  currentMode: 'BUILD',
  isTransitioning: false,
  activeSession: null,
  modeDurations: {
    BUILD: 0,
    FLOW: 0,
    RESTORE: 0,
  },
  currentStreak: 0,
  
  // Actions
  setMode: async () => {},
  startSession: async () => ({} as ModeSession),
  endSession: async () => {},
  getSessionDuration: () => 0,
  
  // Derived state
  isInSession: false,
  currentSessionDuration: 0,
  
  // Loading states
  isLoading: true,
  isError: false,
  error: null,
};

const OrbitModeContext = createContext<ModeContextType>(defaultModeContext);

export const OrbitModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const [currentMode, setCurrentMode] = useState<UserMode>('BUILD');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSession, setActiveSession] = useState<ModeSession | null>(null);
  
  // TRPC mutations and queries
  const startSessionMutation = trpc.mode.startSession.useMutation();
  const endSessionMutation = trpc.mode.endSession.useMutation();
  const getCurrentSessionQuery = trpc.mode.getCurrentSession.useQuery(undefined, {
    enabled: !!user,
  });
  const getModeStatsQuery = trpc.mode.getModeStats.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });
  
  const { data: userPreferences } = trpc.user.getPreferences.useQuery(undefined, {
    enabled: !!user,
  });

  // Set initial mode from user preferences
  useEffect(() => {
    if (userPreferences?.defaultMode) {
      setCurrentMode(userPreferences.defaultMode as UserMode);
    }
  }, [userPreferences]);

  // Update active session and mode when session data changes
  useEffect(() => {
    if (getCurrentSessionQuery.data) {
      setActiveSession({
        ...getCurrentSessionQuery.data,
        startTime: new Date(getCurrentSessionQuery.data.startTime),
        endTime: getCurrentSessionQuery.data.endTime ? new Date(getCurrentSessionQuery.data.endTime) : null,
      });
      
      if (getCurrentSessionQuery.data.mode) {
        setCurrentMode(getCurrentSessionQuery.data.mode as UserMode);
      }
    }
  }, [getCurrentSessionQuery.data]);

  // Calculate current session duration
  const currentSessionDuration = React.useMemo(() => {
    if (!activeSession?.startTime) return 0;
    
    const start = new Date(activeSession.startTime);
    const end = activeSession.endTime ? new Date(activeSession.endTime) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }, [activeSession]);

  // Handle mode change
  const setMode = useCallback(async (newMode: UserMode) => {
    if (newMode === currentMode || !user) return;
    
    setIsTransitioning(true);
    
    try {
      // End current session if exists
      if (activeSession) {
        await endSession();
      }
      
      // Start new session
      const session = await startSessionMutation.mutateAsync({
        mode: newMode,
        energyLevel: 50, // Default energy level, can be adjusted
      });
      
      setActiveSession({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : null,
      });
      
      setCurrentMode(newMode);
      
      // Track mode change in analytics
      // trackAnalytics('mode_change', { from: currentMode, to: newMode });
      
    } catch (error) {
      console.error('Error changing mode:', error);
      // Revert to previous mode on error
      setCurrentMode(currentMode);
    } finally {
      setIsTransitioning(false);
    }
  }, [currentMode, user, activeSession, startSessionMutation]);
  
  // Start a new session
  const startSession = useCallback(async (mode: UserMode, energyLevel: number = 50, taskId?: string) => {
    const session = await startSessionMutation.mutateAsync({
      mode,
      energyLevel,
      taskId,
    });
    
    const newSession = {
      ...session,
      startTime: new Date(session.startTime),
      endTime: session.endTime ? new Date(session.endTime) : null,
    };
    
    setActiveSession(newSession);
    setCurrentMode(mode);
    
    return newSession;
  }, [startSessionMutation]);
  
  // End current session
  const endSession = useCallback(async (energyLevel?: number) => {
    if (!activeSession || !user) return;
    
    try {
      const updatedSession = await endSessionMutation.mutateAsync({
        sessionId: activeSession.id,
        energyLevel,
      });
      
      setActiveSession({
        ...updatedSession,
        startTime: new Date(updatedSession.startTime),
        endTime: updatedSession.endTime ? new Date(updatedSession.endTime) : null,
      });
      
      // Refresh stats after ending a session
      getModeStatsQuery.refetch();
      
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  }, [activeSession, user, endSessionMutation, getModeStatsQuery]);
  
  // Get duration of current or provided session in minutes
  const getSessionDuration = useCallback((session: ModeSession | null = activeSession) => {
    if (!session?.startTime) return 0;
    
    const start = new Date(session.startTime);
    const end = session.endTime ? new Date(session.endTime) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }, [activeSession]);
  
  // Calculate mode durations from stats
  const modeDurations = React.useMemo(() => {
    const durations = {
      BUILD: 0,
      FLOW: 0,
      RESTORE: 0,
    };
    
    if (getModeStatsQuery.data?.modeDurations) {
      Object.entries(getModeStatsQuery.data.modeDurations).forEach(([mode, duration]) => {
        if (mode in durations) {
          durations[mode as UserMode] = Math.round(duration);
        }
      });
    }
    
    return durations;
  }, [getModeStatsQuery.data]);
  
  const currentStreak = getModeStatsQuery.data?.currentStreak || 0;
  
  const value = {
    // State
    currentMode,
    isTransitioning,
    activeSession,
    modeDurations,
    currentStreak,
    
    // Actions
    setMode,
    startSession,
    endSession,
    getSessionDuration,
    
    // Derived state
    isInSession: !!activeSession && !activeSession.endTime,
    currentSessionDuration,
    
    // Loading states
    isLoading: getCurrentSessionQuery.isLoading || getModeStatsQuery.isLoading,
    isError: getCurrentSessionQuery.isError || getModeStatsQuery.isError,
    error: getCurrentSessionQuery.error || getModeStatsQuery.error || null,
  };
  
  return (
    <OrbitModeContext.Provider value={value}>
      {children}
    </OrbitModeContext.Provider>
  );
};

export const useOrbitMode = () => {
  const context = useContext(OrbitModeContext);
  if (!context) {
    throw new Error('useOrbitMode must be used within an OrbitModeProvider');
  }
  return context;
};

// Helper hook for components that only need the current mode
// This prevents unnecessary re-renders when only the mode is needed
export const useCurrentMode = (): UserMode => {
  const { currentMode } = useOrbitMode();
  return currentMode;
};

// Helper hook for components that need to know if they're in a specific mode
export const useIsInMode = (mode: UserMode): boolean => {
  const { currentMode } = useOrbitMode();
  return currentMode === mode;
};
