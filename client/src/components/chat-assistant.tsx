import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic } from "lucide-react";
import { Message, generateId } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatAssistantProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function ChatAssistant({ messages, onSendMessage }: ChatAssistantProps) {
  const [message, setMessage] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const suggestions = [
    "Need help deciding?",
    "Reframe task", 
    "Clear mental fog"
  ];

  return (
    <div className="flex flex-col h-[85vh]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.role === "assistant" ? "" : "justify-end"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-[#9F7AEA]/20 flex items-center justify-center">
                  <div className="w-4 h-4 text-[#9F7AEA]">⚡</div>
                </div>
              )}
              <Card 
                className={`p-4 max-w-[80%] ${
                  msg.role === "assistant" 
                    ? "rounded-tl-none" 
                    : "rounded-tr-none"
                }`}
              >
                <p className="text-primary">{msg.content}</p>
              </Card>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-[#B2F5EA]/20 flex items-center justify-center">
                  <div className="w-4 h-4 text-[#B2F5EA]">👤</div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Quick Suggestions */}
      <div className="flex gap-2 mb-4 overflow-x-auto py-2">
        {suggestions.map((suggestion) => (
          <Button
            key={suggestion}
            variant="suggestion"
            onClick={() => onSendMessage(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
      
      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a message..."
          className="w-full rounded-full py-3 pl-4 pr-12"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1 w-10 h-10 rounded-full bg-[#9F7AEA]/10 text-[#9F7AEA]"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
