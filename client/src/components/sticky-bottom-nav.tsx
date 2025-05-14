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
          accent: '#9F7AEA', // Purple
          accentLight: 'rgba(159, 122, 234, 0.2)',
          gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/5',
          emoji: '⚡️'
        };
      case 'maintain':
        return {
          accent: '#63B3ED', // Blue
          accentLight: 'rgba(99, 179, 237, 0.2)',
          gradient: 'from-blue-400/20 via-blue-500/10 to-blue-600/5',
          emoji: '🔄'
        };
      case 'recover':
        return {
          accent: '#B2F5EA', // Teal
          accentLight: 'rgba(178, 245, 234, 0.2)',
          gradient: 'from-teal-400/20 via-teal-500/10 to-teal-600/5',
          emoji: '❤️‍🩹'
        };
      case 'reflect':
        return {
          accent: '#76E4F7', // Cyan
          accentLight: 'rgba(118, 228, 247, 0.2)',
          gradient: 'from-cyan-400/20 via-cyan-500/10 to-cyan-600/5',
          emoji: '🧠'
        };
      default:
        return {
          accent: '#9F7AEA', // Purple (default)
          accentLight: 'rgba(159, 122, 234, 0.2)',
          gradient: 'from-purple-500/20 via-purple-600/10 to-purple-800/5',
          emoji: '⚡️'
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

  // Handle showing/hiding nav based on scroll - always keep nav visible
  useEffect(() => {
    // No need to add scroll listener since we're always showing the nav
    setShowNav(true);
    
    // But still track scroll to calculate other UI elements if needed
    const handleScroll = () => {
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Spacer div to prevent content from being hidden behind the nav */}
      <div className="h-20"></div>
      
      {/* Fixed bottom navigation */}
      <motion.div 
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out",
          showNav ? "translate-y-0" : "translate-y-full"
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-2 relative">
          {/* Add task button (centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <motion.button
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.accent }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${colors.accentLight}` }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTaskModal(true)}
            >
              <Plus className="text-white h-7 w-7" />
            </motion.button>
          </div>
          
          {/* Navigation items */}
          <div className="flex justify-between items-center py-3">
            {navItems.map((item) => {
              const isActive = location === item.route || 
                             (item.mode && item.mode === mode);
              
              return (
                <Link key={item.route} href={item.route}>
                  <a className="block py-1.5 px-3 touch-manipulation">
                    <div 
                      className={cn(
                        "flex flex-col items-center transition-colors min-w-[60px]",
                        isActive 
                          ? `text-[${colors.accent}]` 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-full transition-all",
                        isActive && `bg-gradient-to-b ${colors.gradient}`
                      )}>
                        {item.icon}
                      </div>
                      <span className={cn(
                        "text-xs mt-1.5 font-medium",
                        isActive && "font-semibold"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div 
                          className="h-1.5 w-1.5 rounded-full mt-1"
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