import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Send, Brain, RefreshCcw, MessageSquareMore, Clock, Pause } from "lucide-react";
import { Message, generateId, Mode, Mood } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useOrbit } from "@/context/orbit-context";
import { Badge } from "@/components/ui/badge";

interface ChatAssistantProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatAssistant({ messages, onSendMessage }: ChatAssistantProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { mode, mood, energy } = useOrbit();
  
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
      { text: "Reframe task", icon: <RefreshCcw size={14} /> },
      { text: "Need help deciding?", icon: <Brain size={14} /> }
    ];
    
    // Add mode-specific suggestions
    switch(mode) {
      case 'build':
        return [
          ...baseSuggestions,
          { text: "Break down my next task", icon: <MessageSquareMore size={14} /> },
          { text: "Prioritize my tasks", icon: <Clock size={14} /> }
        ];
      case 'recover':
        return [
          ...baseSuggestions,
          { text: "Clear mental fog", icon: <Brain size={14} /> },
          { text: "Suggest a microbreak", icon: <Pause size={14} /> }
        ];
      case 'reflect':
        return [
          ...baseSuggestions,
          { text: "What patterns do you notice?", icon: <Brain size={14} /> },
          { text: "Help me reflect on today", icon: <MessageSquareMore size={14} /> }
        ];
      default:
        return baseSuggestions;
    }
  };
  
  // Get color theme based on current mode
  const getModeColors = () => {
    switch(mode) {
      case 'build':
        return {
          accent: 'bg-[#9F7AEA]',
          accentLight: 'bg-[#9F7AEA]/20',
          text: 'text-[#9F7AEA]'
        };
      case 'recover':
        return {
          accent: 'bg-[#FC8181]',
          accentLight: 'bg-[#FC8181]/20',
          text: 'text-[#FC8181]'
        };
      case 'reflect':
        return {
          accent: 'bg-[#76E4F7]',
          accentLight: 'bg-[#76E4F7]/20',
          text: 'text-[#76E4F7]'
        };
      default:
        return {
          accent: 'bg-[#9F7AEA]',
          accentLight: 'bg-[#9F7AEA]/20',
          text: 'text-[#9F7AEA]'
        };
    }
  };
  
  const colors = getModeColors();
  const suggestions = getSuggestions();

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Context header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Badge className={`${colors.accentLight} ${colors.text}`}>
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-muted-foreground">
            Energy: {energy}%
          </Badge>
        </div>
      </div>
      
      {/* Messages area with improved spacing */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-6 pr-1">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex items-start gap-3 mb-6 ${msg.role === "assistant" ? "" : "justify-end"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "assistant" && (
                <div className={`w-8 h-8 rounded-full ${colors.accentLight} flex items-center justify-center`}>
                  <div className={`w-4 h-4 ${colors.text}`}>⚡</div>
                </div>
              )}
              <Card 
                className={`p-4 max-w-[80%] ${
                  msg.role === "assistant" 
                    ? `rounded-tl-none border-l-2 ${colors.text} bg-card/80`
                    : "rounded-tr-none bg-card/50"
                }`}
              >
                <p className={`${msg.role === "assistant" ? "text-primary" : "text-primary/90"}`}>{msg.content}</p>
                <div className="text-xs opacity-60 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#B2F5EA]/20 flex items-center justify-center">
                  <div className="w-4 h-4 text-[#B2F5EA]">👤</div>
                </div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      {/* Quick Suggestions - enhanced with icons and visual appeal */}
      <div className="flex gap-2 mb-4 overflow-x-auto py-2 pb-3 snap-x">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion.text}
            variant="outline"
            size="sm"
            onClick={() => onSendMessage(suggestion.text)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-muted hover:${colors.accentLight} hover:${colors.text} transition-colors snap-start`}
          >
            {suggestion.icon}
            <span>{suggestion.text}</span>
          </Button>
        ))}
      </div>
      
      {/* Chat Input - enhanced with send button */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="w-full rounded-full py-3 pl-4 pr-12"
        />
        {message.trim() ? (
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className={`absolute right-1 top-1 w-10 h-10 rounded-full ${colors.accentLight} ${colors.text}`}
          >
            <Send className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`absolute right-1 top-1 w-10 h-10 rounded-full ${colors.accentLight} ${colors.text}`}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </form>
    </div>
  );
}
