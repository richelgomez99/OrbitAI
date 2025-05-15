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
      className="fixed bottom-0 left-0 right-0 bg-[rgba(31,31,31,0.7)] backdrop-blur-md p-4 z-50 border-t border-gray-800"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto flex justify-around items-center">
        <Link href="/flow">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center ${location === "/flow" ? "text-[#9F7AEA]" : "text-secondary"}`}
          >
            <Zap className="h-5 w-5 mb-1" />
            <span className="text-xs">Flow</span>
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center ${location === "/dashboard" ? "text-[#9F7AEA]" : "text-secondary"}`}
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
            className={`flex flex-col items-center ${location === "/reflect" ? "text-[#9F7AEA]" : "text-secondary"}`}
          >
            <Brain className="h-5 w-5 mb-1" />
            <span className="text-xs">Reflect</span>
          </Button>
        </Link>
        
        <Link href="/chat">
          <Button 
            variant="ghost" 
            className={`flex flex-col items-center ${location === "/chat" ? "text-[#9F7AEA]" : "text-secondary"}`}
          >
            <MessageCircle className="h-5 w-5 mb-1" />
            <span className="text-xs">Chat</span>
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}
