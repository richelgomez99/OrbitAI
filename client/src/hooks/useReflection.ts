import { trpc } from '@/lib/trpc';

export interface Reflection {
  id: string;
  userId: string;
  mood: number;
  energy: number;
  wins: string;
  challenges: string;
  journalEntry: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const useReflection = () => {
  const utils = trpc.useContext();
  
  // Fetch all reflections
  const { data: reflections = [], isLoading, error } = trpc.reflection.getAll.useQuery();
  
  // Create a new reflection
  const createReflection = trpc.reflection.create.useMutation({
    onSuccess: () => {
      utils.reflection.invalidate();
    },
  });
  
  // Update an existing reflection
  const updateReflection = trpc.reflection.update.useMutation({
    onSuccess: () => {
      utils.reflection.invalidate();
    },
  });
  
  // Delete a reflection
  const deleteReflection = trpc.reflection.delete.useMutation({
    onSuccess: () => {
      utils.reflection.invalidate();
    },
  });
  
  // Add a new reflection
  const addReflection = async (reflectionData: {
    wins: string;
    challenges: string;
    journalEntry: string;
    mood: number;
    energy: number;
    tags?: string[];
  }) => {
    return createReflection.mutateAsync({
      ...reflectionData,
      tags: reflectionData.tags || [],
    });
  };
  
  // Get reflection by ID
  const getReflection = async (id: string) => {
    return trpc.reflection.getById.query({ id });
  };
  
  // Get reflections by date range
  const getReflectionsByDateRange = async (startDate: Date, endDate: Date) => {
    return trpc.reflection.getByDateRange.query({ startDate, endDate });
  };
  
  // Get mood trends over time
  const getMoodTrends = async (days: number = 30) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return trpc.reflection.getMoodTrends.query({ 
      startDate, 
      endDate 
    });
  };
  
  return {
    reflections,
    loading: isLoading,
    error,
    addReflection,
    updateReflection: updateReflection.mutateAsync,
    deleteReflection: deleteReflection.mutateAsync,
    getReflection,
    getReflectionsByDateRange,
    getMoodTrends,
  };
};
