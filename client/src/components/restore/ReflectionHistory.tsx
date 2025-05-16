import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ChevronDown, ChevronUp, Calendar, Clock, Zap, Gauge, Grip, Check, X } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';

interface Reflection {
  id: string;
  mood: string;
  energy: number;
  win?: string;
  challenge?: string;
  journal?: string;
  emotionLabel?: string;
  cognitiveLoad?: number;
  control?: number;
  clarityGained?: boolean;
  groundingStrategies: Array<{ name: string }>;
  createdAt: string;
  updatedAt: string;
}

const EMOTION_EMOJIS: Record<string, string> = {
  'overstimulated': '😵‍💫',
  'anxious': '😰',
  'tired': '😴',
  'calm': '😌',
  'focused': '🧠',
  'creative': '✨',
};

const getEmojiForLabel = (label?: string) => {
  if (!label) return '';
  const key = label.toLowerCase().replace(/\s+/g, '');
  return EMOTION_EMOJIS[key] || '✨';
};

export const ReflectionHistory: React.FC = () => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();

  const loadReflections = async (loadMore = false) => {
    if ((!loadMore && reflections.length > 0) || (loadMore && !hasMore)) return;
    
    const loadingState = loadMore ? setLoadingMore : setLoading;
    loadingState(true);
    
    try {
      const params = new URLSearchParams();
      params.append('limit', '10');
      if (cursor) params.append('cursor', cursor);
      
      const response = await fetch(`/api/reflections?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load reflections');
      
      const data = await response.json();
      setReflections(prev => loadMore ? [...prev, ...data.items] : data.items);
      setHasMore(!!data.nextCursor);
      if (data.nextCursor) setCursor(data.nextCursor);
    } catch (error) {
      console.error('Error loading reflections:', error);
    } finally {
      loadingState(false);
    }
  };

  useEffect(() => {
    loadReflections();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (loading && reflections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reflections.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No reflections yet. Start by adding your first reflection!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {reflections.map((reflection) => (
          <motion.div
            key={reflection.id}
            className="border rounded-lg overflow-hidden bg-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              className="w-full px-4 py-3 text-left flex items-center justify-between"
              onClick={() => toggleExpand(reflection.id)}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {reflection.emotionLabel ? getEmojiForLabel(reflection.emotionLabel) : '✨'}
                </span>
                <div>
                  <div className="font-medium">
                    {reflection.mood.charAt(0).toUpperCase() + reflection.mood.slice(1)}
                    {reflection.emotionLabel && ` • ${reflection.emotionLabel}`}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center space-x-2">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(reflection.createdAt)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(reflection.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {expandedId === reflection.id ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            
            <AnimatePresence>
              {expandedId === reflection.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 space-y-4"
                >
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Highlights & Challenges</h4>
                    <div className="space-y-3">
                      {reflection.win && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-300" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-green-800 dark:text-green-200">
                                {reflection.win}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {reflection.challenge && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                                <X className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-amber-800 dark:text-amber-200">
                                {reflection.challenge}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(reflection.cognitiveLoad !== undefined || reflection.control !== undefined || 
                    reflection.clarityGained !== undefined || reflection.groundingStrategies?.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Advanced Insights</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {reflection.cognitiveLoad !== undefined && (
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Cognitive Load</p>
                                <p className="font-medium">{reflection.cognitiveLoad}/100</p>
                              </div>
                            </div>
                            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${reflection.cognitiveLoad}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {reflection.control !== undefined && (
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                                <Grip className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Control</p>
                                <p className="font-medium">{reflection.control}/5</p>
                              </div>
                            </div>
                            <div className="mt-2 flex space-x-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <div 
                                  key={i}
                                  className={`h-2 flex-1 rounded-full ${i <= reflection.control! 
                                    ? 'bg-purple-500' 
                                    : 'bg-gray-200 dark:bg-gray-700'}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {reflection.clarityGained !== undefined && (
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/30">
                                <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Clarity Gained</p>
                                <p className="font-medium">
                                  {reflection.clarityGained ? 'Yes' : 'No'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {reflection.groundingStrategies?.length > 0 && (
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-start space-x-2">
                              <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                                <svg 
                                  className="w-4 h-4 text-amber-600 dark:text-amber-400" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Grounding Strategies</p>
                                <div className="flex flex-wrap gap-2">
                                  {reflection.groundingStrategies.map((strategy) => (
                                    <span 
                                      key={strategy.name} 
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                    >
                                      {strategy.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {reflection.journal && (
                    <div className="bg-muted p-4 rounded-md">
                      <h4 className="font-medium mb-2">Journal Entry</h4>
                      <p className="text-sm whitespace-pre-line">{reflection.journal}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => loadReflections(true)}
            disabled={loadingMore}
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
