import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Construction, 
  Gauge, 
  Heart, 
  BarChart4, 
  Plus,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";

export function StickyBottomNav() {
  const [location] = useLocation();
  const { setShowAddTaskModal, mode } = useOrbit();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get mode-specific colors
  const getModeColors = () => {
    switch(mode) {
      case 'build':
        return {
          accent: '#9F7AEA',
          accentLight: 'rgba(159, 122, 234, 0.2)',
          gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/5'
        };
      case 'maintain':
        return {
          accent: '#76E4F7',
          accentLight: 'rgba(118, 228, 247, 0.2)',
          gradient: 'from-cyan-500/20 via-cyan-600/10 to-cyan-800/5'
        };
      case 'recover':
        return {
          accent: '#FC8181',
          accentLight: 'rgba(252, 129, 129, 0.2)',
          gradient: 'from-red-400/20 via-red-500/10 to-red-600/5'
        };
      case 'reflect':
        return {
          accent: '#4299E1',
          accentLight: 'rgba(66, 153, 225, 0.2)',
          gradient: 'from-blue-500/20 via-blue-600/10 to-blue-800/5'
        };
      default:
        return {
          accent: '#9F7AEA',
          accentLight: 'rgba(159, 122, 234, 0.2)',
          gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/5'
        };
    }
  };

  const colors = getModeColors();
  
  // Icons and their corresponding routes
  const navItems = [
    { icon: <Construction size={24} />, label: "Build", route: "/flow", mode: "build" },
    { icon: <Gauge size={24} />, label: "Maintain", route: "/maintain", mode: "maintain" },
    { icon: <Heart size={24} />, label: "Recover", route: "/recover", mode: "recover" },
    { icon: <BarChart4 size={24} />, label: "Reflect", route: "/reflect", mode: "reflect" },
    { icon: <MessageSquare size={24} />, label: "Chat", route: "/chat", mode: "" }
  ];

  // Handle showing/hiding nav based on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show nav regardless of scroll direction
      setShowNav(true);
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      {/* Spacer div to prevent content from being hidden behind the nav */}
      <div className="h-20"></div>
      
      {/* Fixed bottom navigation */}
      <motion.div 
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-gray-800 z-50 transition-all duration-300 ease-in-out",
          showNav ? "translate-y-0" : "translate-y-full"
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 relative">
          {/* Add task button (centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6">
            <motion.button
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.accent }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${colors.accentLight}` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTaskModal(true)}
            >
              <Plus className="text-white h-6 w-6" />
            </motion.button>
          </div>
          
          {/* Navigation items */}
          <div className="flex justify-between items-center py-2">
            {navItems.map((item) => {
              const isActive = location === item.route || 
                             (item.mode && item.mode === mode);
              
              return (
                <Link key={item.route} href={item.route}>
                  <a className="block py-2 px-4">
                    <div 
                      className={cn(
                        "flex flex-col items-center transition-all",
                        isActive 
                          ? `text-[${colors.accent}]` 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-full transition-all",
                        isActive && `bg-gradient-to-b ${colors.gradient}`
                      )}>
                        {item.icon}
                      </div>
                      <span className={cn(
                        "text-xs mt-1 font-medium",
                        isActive && "font-semibold"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div 
                          className="h-1 w-1 rounded-full mt-1"
                          style={{ backgroundColor: colors.accent }}
                          layoutId="navIndicator"
                        />
                      )}
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}