import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, PieChart, Plus, Brain, MessageCircle } from "lucide-react"; // Replaced List with Zap
import { motion } from "framer-motion";
import { useOrbit } from "@/context/orbit-context";

export default function AppNavigation() {
  const [location] = useLocation();
  const { setShowAddTaskModal } = useOrbit();
  
  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-[#1A1A1E] p-3 z-50 border-t border-gray-700 shadow-xl"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex justify-around items-center">
        <Link href="/flow">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center px-3 py-2 rounded-lg ${location === "/flow" ? "text-[#9F7AEA] bg-purple-500/10" : "text-gray-400"}`}
          >
            <Zap className="h-5 w-5 mb-1" />
            <span className="text-xs">Flow</span>
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center px-3 py-2 rounded-lg ${location === "/dashboard" ? "text-[#9F7AEA] bg-purple-500/10" : "text-gray-400"}`}
          >
            <PieChart className="h-5 w-5 mb-1" />
            <span className="text-xs">Dashboard</span>
          </Button>
        </Link>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setShowAddTaskModal(true)}
            className="relative -top-6 bg-[#9F7AEA] w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </motion.div>
        
        <Link href="/reflect">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center px-3 py-2 rounded-lg ${location === "/reflect" ? "text-[#9F7AEA] bg-purple-500/10" : "text-gray-400"}`}
          >
            <Brain className="h-5 w-5 mb-1" />
            <span className="text-xs">Reflect</span>
          </Button>
        </Link>
        
        <Link href="/chat">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center px-3 py-2 rounded-lg ${location === "/chat" ? "text-[#9F7AEA] bg-purple-500/10" : "text-gray-400"}`}
          >
            <MessageCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Chat</span>
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}
