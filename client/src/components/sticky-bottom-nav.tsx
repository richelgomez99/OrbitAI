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
import { cn, getModeTheme, type Mode } from "@/lib/utils";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";

export function StickyBottomNav() {
  const [location] = useLocation();
  const { setShowAddTaskModal, mode } = useOrbit();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Get theme for the current mode
  const theme = getModeTheme(mode);
  
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
              className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${theme.accent}`}
              whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${theme.accentLightHex}` }}
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
              
              const itemTheme = item.mode ? getModeTheme(item.mode as Mode) : theme;
              
              return (
                <Link key={item.route} href={item.route}>
                  <a className="block py-1.5 px-3 touch-manipulation">
                    <div 
                      className={cn(
                        "flex flex-col items-center transition-colors min-w-[60px]",
                        isActive 
                          ? itemTheme.text 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 rounded-full transition-all",
                        isActive && `bg-gradient-to-b ${itemTheme.gradient}`
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
                          className={`h-1.5 w-1.5 rounded-full mt-1 ${itemTheme.accent}`}
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