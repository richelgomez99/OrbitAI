import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/trpc/client';
import { UserMode } from '@/context/OrbitModeContext';

export const useOrbitMode = () => {
  const { data: session } = useSession();
  const [currentMode, setCurrentMode] = useState<UserMode>('BUILD');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [modeDurations, setModeDurations] = useState<Record<UserMode, number>>({
    BUILD: 0,
    FLOW: 0,
    RESTORE: 0,
  });
  const [streak, setStreak] = useState(0);

  // TRPC mutations and queries
  const startSessionMutation = api.mode.startSession.useMutation();
  const endSessionMutation = api.mode.endSession.useMutation();
  const getCurrentSessionQuery = api.mode.getCurrentSession.useQuery(undefined, {
    enabled: !!session,
  });
  const getModeStatsQuery = api.mode.getModeStats.useQuery(undefined, {
    enabled: !!session,
    refetchInterval: 60000, // Refetch every minute
  });

  // Set initial mode from user preferences or default to BUILD
  useEffect(() => {
    if (session?.user?.preferences?.defaultMode) {
      setCurrentMode(session.user.preferences.defaultMode);
    }
  }, [session]);

  // Update active session and mode when session data changes
  useEffect(() => {
    if (getCurrentSessionQuery.data) {
      setActiveSession(getCurrentSessionQuery.data);
      if (getCurrentSessionQuery.data.mode) {
        setCurrentMode(getCurrentSessionQuery.data.mode as UserMode);
      }
    }
  }, [getCurrentSessionQuery.data]);

  // Update mode durations and streak when stats change
  useEffect(() => {
    if (getModeStatsQuery.data) {
      setModeDurations(prev => ({
        ...prev,
        ...getModeStatsQuery.data.modeDurations,
      }));
      setStreak(getModeStatsQuery.data.currentStreak);
    }
  }, [getModeStatsQuery.data]);

  // Handle mode change
  const setMode = useCallback(
    async (newMode: UserMode) => {
      if (newMode === currentMode || !session) return;

      setIsTransitioning(true);

      try {
        // End current session if exists
        if (activeSession) {
          await endSessionMutation.mutateAsync({
            sessionId: activeSession.id,
            endTime: new Date(),
          });
        }


        // Start new session
        const newSession = await startSessionMutation.mutateAsync({
          mode: newMode,
          energyLevel: 50, // Default energy level, can be adjusted
        });

        setActiveSession(newSession);
        setCurrentMode(newMode);
      } catch (error) {
        console.error('Error changing mode:', error);
        // Revert to previous mode on error
        setCurrentMode(currentMode);
      } finally {
        setIsTransitioning(false);
      }
    },
    [currentMode, session, activeSession, endSessionMutation, startSessionMutation]
  );

  // End current session
  const endCurrentSession = useCallback(async () => {
    if (!activeSession || !session) return;

    try {
      await endSessionMutation.mutateAsync({
        sessionId: activeSession.id,
        endTime: new Date(),
      });
      setActiveSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [activeSession, session, endSessionMutation]);

  // Calculate session duration in minutes
  const getSessionDuration = useCallback(() => {
    if (!activeSession?.startTime) return 0;
    
    const start = new Date(activeSession.startTime);
    const end = activeSession.endTime ? new Date(activeSession.endTime) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }, [activeSession]);

  return {
    // State
    currentMode,
    isTransitioning,
    activeSession,
    modeDurations,
    streak,
    
    // Actions
    setMode,
    endCurrentSession,
    getSessionDuration,
    
    // Loading states
    isLoading: getCurrentSessionQuery.isLoading || getModeStatsQuery.isLoading,
    isError: getCurrentSessionQuery.isError || getModeStatsQuery.isError,
    error: getCurrentSessionQuery.error || getModeStatsQuery.error,
  };
};
