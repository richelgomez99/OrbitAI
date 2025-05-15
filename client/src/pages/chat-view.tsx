import { ChatAssistant } from "@/components/chat-assistant";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";

export default function ChatView() {
  const { messages, sendMessage, aiSuggestions } = useOrbit();

  return (
    <div className="page-transition animate-fade-in px-4 pb-24 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatAssistant 
          messages={messages} 
          onSendMessage={sendMessage} 
          aiSuggestions={aiSuggestions} // Pass suggestions to the component
        />
      </motion.div>
    </div>
  );
}
