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
      className="fixed bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-lg p-3 z-50 rounded-2xl shadow-2xl border border-slate-700/60"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
    >
      <div className="container mx-auto flex justify-around items-center">
        <Link href="/flow">
          <Button 
            variant="ghost" 
            className={`relative flex flex-col items-center px-3 py-2 rounded-lg ${location === "/flow" ? "bg-purple-500 text-white" : "text-gray-400 hover:bg-gray-700/70 hover:text-gray-200"}`}
          >
            <motion.div animate={{ scale: location === "/flow" ? 1.2 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><Zap className="h-5 w-5 mb-1" /></motion.div>
            <span className="text-xs">Flow</span>
            {location === "/flow" && (
              <motion.div
                className="absolute -bottom-1 left-1/4 right-1/4 h-1 bg-white rounded-full"
                layoutId="activeNavUnderline"
              />
            )}
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button 
            variant="ghost" 
            className={`relative flex flex-col items-center px-3 py-2 rounded-lg ${location === "/dashboard" ? "bg-purple-500 text-white" : "text-gray-400 hover:bg-gray-700/70 hover:text-gray-200"}`}
          >
            <motion.div animate={{ scale: location === "/dashboard" ? 1.2 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><PieChart className="h-5 w-5 mb-1" /></motion.div>
            <span className="text-xs">Dashboard</span>
            {location === "/dashboard" && (
              <motion.div
                className="absolute -bottom-1 left-1/4 right-1/4 h-1 bg-white rounded-full"
                layoutId="activeNavUnderline"
              />
            )}
          </Button>
        </Link>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => setShowAddTaskModal(true)}
            className="relative -top-6 bg-[#9F7AEA] w-14 h-14 rounded-full flex items-center justify-center shadow-lg" aria-label="Add New Task"
          >
            <Plus className="h-6 w-6 text-white" aria-hidden="true" />
          </Button>
        </motion.div>
        
        <Link href="/reflect">
          <Button 
            variant="ghost" 
            className={`relative flex flex-col items-center px-3 py-2 rounded-lg ${location === "/reflect" ? "bg-purple-500 text-white" : "text-gray-400 hover:bg-gray-700/70 hover:text-gray-200"}`}
          >
            <motion.div animate={{ scale: location === "/reflect" ? 1.2 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><Brain className="h-5 w-5 mb-1" /></motion.div>
            <span className="text-xs">Reflect</span>
            {location === "/reflect" && (
              <motion.div
                className="absolute -bottom-1 left-1/4 right-1/4 h-1 bg-white rounded-full"
                layoutId="activeNavUnderline"
              />
            )}
          </Button>
        </Link>
        
        <Link href="/chat">
          <Button 
            variant="ghost" 
            className={`relative flex flex-col items-center px-3 py-2 rounded-lg ${location === "/chat" ? "bg-purple-500 text-white" : "text-gray-400 hover:bg-gray-700/70 hover:text-gray-200"}`}
          >
            <motion.div animate={{ scale: location === "/chat" ? 1.2 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}><MessageCircle className="h-5 w-5 mb-1" /></motion.div>
            <span className="text-xs">Chat</span>
            {location === "/chat" && (
              <motion.div
                className="absolute -bottom-1 left-1/4 right-1/4 h-1 bg-white rounded-full"
                layoutId="activeNavUnderline"
              />
            )}
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
}
