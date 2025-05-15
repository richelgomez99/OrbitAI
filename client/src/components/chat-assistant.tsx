import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Brain, RefreshCcw, MessageSquareMore, Clock, Pause } from "lucide-react";
import { Message, generateId, Mode, Mood, getModeTheme, getMoodEmoji, getEnergyDisplay, Task, Priority, parseEstimatedTime } from "@/lib/utils";
import type { AISuggestion } from "@/lib/ai"; // Import AISuggestion type
import { motion, AnimatePresence } from "framer-motion";
import { useOrbit } from "@/context/orbit-context";
import { Badge } from "@/components/ui/badge";

interface ChatAssistantProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  aiSuggestions?: AISuggestion[]; // Add prop for AI suggestions
}

export function ChatAssistant({ messages, onSendMessage, aiSuggestions }: ChatAssistantProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode, mood, energy, openAddTaskModalWithData } = useOrbit();
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Suggestions based on the user's current mode and mood
  const getSuggestions = () => {
    const baseSuggestions = [
      { text: "Reframe a task", icon: <RefreshCcw size={14} /> },
      { text: "Need help deciding?", icon: <Brain size={14} /> }
    ];

    let modeSpecificSuggestions: { text: string; icon: JSX.Element }[] = [];

    switch(mode) {
      case 'build':
        modeSpecificSuggestions = [
          { text: "Break down my next task", icon: <MessageSquareMore size={14} /> },
          { text: "Prioritize tasks for today", icon: <Clock size={14} /> }
        ];
        break;
      case 'recover':
        modeSpecificSuggestions = [
          { text: "Help me clear mental fog", icon: <Brain size={14} /> },
          { text: "Suggest a 5-min microbreak", icon: <Pause size={14} /> }
        ];
        break;
      case 'reflect':
        modeSpecificSuggestions = [
          { text: "What were my wins today?", icon: <MessageSquareMore size={14} /> },
          { text: "Help me journal about my mood", icon: <Brain size={14} /> }
        ];
        break;
      case 'flow':
        modeSpecificSuggestions = [
          { text: "What's one small step?", icon: <MessageSquareMore size={14} /> },
          { text: "Help me deepen focus", icon: <Brain size={14} /> }
        ];
        break;
      default:
        // Optional: handle unexpected mode or just return base
        const _exhaustiveCheck: never = mode;
        console.warn(`Unhandled mode for suggestions: ${_exhaustiveCheck}`);
        break;
    }
    return [...baseSuggestions, ...modeSpecificSuggestions];
  };
  
  // Get theme based on current mode
  const theme = getModeTheme(mode);
  const moodEmoji = getMoodEmoji(mood);
  const energyDisplay = getEnergyDisplay(energy);
  // Determine which set of suggestions to use
  const currentSuggestions: (AISuggestion | { text: string; icon?: JSX.Element })[] = 
    (aiSuggestions && aiSuggestions.length > 0) 
    ? aiSuggestions 
    : getSuggestions();

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Context header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Badge className={`bg-[hsl(${theme.accentHsl})] text-white shadow-sm px-3 py-1 text-sm font-medium`}>
            <span className="mr-1.5">{theme.emoji}</span>
            {theme.label} Mode
          </Badge>
          <Badge 
            variant="outline" 
            className={`border border-[hsl(${theme.accentHsl}/0.4)] text-[hsl(${theme.accentHsl})] px-3 py-1 text-sm shadow-sm`}
          >
            <span className="mr-1.5">{moodEmoji}</span>
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Badge>
          <Badge 
            variant="outline" 
            className={`border border-[hsl(${theme.accentHsl}/0.4)] ${energyDisplay.color} px-3 py-1 text-sm shadow-sm`}
          >
            <span className="mr-1.5">{energyDisplay.icon}</span>
            Energy: {energy}%
          </Badge>
        </div>
      </div>
      
      {/* Messages area with improved spacing */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-8 pr-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex items-start gap-3 mb-8 ${msg.role === "assistant" ? "" : "justify-end"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "assistant" && (
                <div className={`w-9 h-9 rounded-full bg-[hsl(${theme.accentHsl}/0.1)] flex items-center justify-center shadow-md`}>
                  <div className={`w-5 h-5 text-[hsl(${theme.accentHsl})]`}>{theme.emoji}</div>
                </div>
              )}
              <Card 
                className={`p-4 max-w-[85%] shadow-md ${
                  msg.role === "assistant" 
                    ? `rounded-tl-none border-l-2 border-[hsl(${theme.accentHsl}/0.4)] bg-[hsl(${theme.accentHsl}/0.1)] bg-card/90 backdrop-blur-sm`
                    : "rounded-tr-none bg-card/70"
                }`}
              >
                <p className={`${msg.role === "assistant" ? "text-primary whitespace-pre-line" : "text-primary/90"}`}>
                  {msg.content}
                </p>
                <div className="text-xs opacity-60 mt-2 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </Card>
              {msg.role === "user" && (
                <div className="w-9 h-9 rounded-full bg-[#B2F5EA]/20 flex items-center justify-center shadow-md">
                  <div className="w-5 h-5 text-[#B2F5EA]">👤</div>
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      {/* Quick Suggestions - enhanced with icons and visual appeal */}
      <div className="flex gap-2 mb-5 overflow-x-auto py-2 pb-3 snap-x">
        {currentSuggestions.map((suggestion, index) => {
          const isAISuggestion = (s: any): s is AISuggestion => typeof s.type === 'string';
          
          let suggestionText: string;
          let suggestionIcon: JSX.Element | undefined = undefined;

          if (isAISuggestion(suggestion)) {
            suggestionText = suggestion.type === 'new_task' ? `Create: ${suggestion.title}` : suggestion.title;
            // You could assign an icon based on suggestion.type or other properties here
            // e.g., if (suggestion.type === 'new_task') suggestionIcon = <PlusCircle size={14} />;
          } else {
            suggestionText = suggestion.text;
            suggestionIcon = suggestion.icon;
          }

          return (
            <Button
              key={isAISuggestion(suggestion) ? `${suggestion.type}-${suggestion.title}-${index}` : `${suggestionText}-${index}`}
              variant="outline"
              size="sm"
              onClick={() => {
                if (isAISuggestion(suggestion)) {
                  if (suggestion.type === 'new_task') {
                    const taskData: Partial<Task> = {
                      title: suggestion.title,
                      description: suggestion.description,
                      priority: suggestion.priority as Priority, // Assumes AISuggestion priority is compatible
                      estimatedTime: parseEstimatedTime(suggestion.estimated_time),
                      tags: suggestion.tags,
                      mode: suggestion.mode, // Assign mode if present in suggestion
                      isAiGenerated: true,
                    };
                    openAddTaskModalWithData(taskData);
                  } else { // 'chat_prompt'
                    onSendMessage(suggestion.title);
                  }
                } else { // Static suggestion
                  onSendMessage(suggestionText);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full border border-[hsl(${theme.accentHsl}/0.4)] hover:bg-[hsl(${theme.accentHsl}/0.1)] hover:text-[hsl(${theme.accentHsl})] transition-colors snap-start shadow-sm min-h-[36px]`}
            >
              {suggestionIcon && <span className={`text-[hsl(${theme.accentHsl})]`}>{suggestionIcon}</span>}
              <span>{suggestionText}</span>
            </Button>
          );
        })}
      </div>
      
      {/* Chat Input - enhanced with send button */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className={`w-full rounded-full py-3 pl-5 pr-14 border border-[hsl(${theme.accentHsl}/0.4)] shadow-md text-primary`}
        />
        {message.trim() ? (
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={`absolute right-1.5 top-1.5 w-10 h-10 rounded-full bg-[hsl(${theme.accentHsl})] text-white shadow-sm`}
          >
            <Send className="h-4 w-4 text-white" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`absolute right-1.5 top-1.5 w-10 h-10 rounded-full bg-[hsl(${theme.accentHsl}/0.1)] text-[hsl(${theme.accentHsl})] shadow-sm`}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
