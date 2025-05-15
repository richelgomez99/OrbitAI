import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Construction, 
  Heart, 
  MessageSquare,
  Plus,
  Zap
} from "lucide-react";
import { cn, getModeTheme, type Mode, type ModeTheme } from "@/lib/utils";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";

// Helper to parse HSL string like "260 81% 61%" into an object {h, s, l}
const parseHslString = (hslString: string): { h: string; s: string; l: string } | null => {
  const match = hslString.match(/(\d+)\s+(\d+%)\s+(\d+%)/);
  if (match) {
    return { h: match[1], s: match[2], l: match[3] };
  }
  return null;
};

export function StickyBottomNav() {
  const [location] = useLocation();
  const { setShowAddTaskModal, mode, setMode } = useOrbit();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const currentTheme = getModeTheme(mode);
  const currentThemeHsl = parseHslString(currentTheme.accentHsl);

  const navItems = [
    { icon: <Construction size={24} />, label: "Build", route: "/build", mode: "build" as Mode },
    { icon: <Zap size={24} />, label: "Flow", route: "/flow", mode: "flow" as Mode },
    { icon: <Heart size={24} />, label: "Restore", route: "/restore", mode: "restore" as Mode },
    { icon: <MessageSquare size={24} />, label: "Chat", route: "/chat", mode: "" as any } // Chat doesn't have a mode theme
  ];

  useEffect(() => {
    setShowNav(true);
    const handleScroll = () => setLastScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log(`StickyBottomNav Effect: Location: ${location}, Mode: ${mode}`);
  }, [location, mode]);

  // Define styles using CSS variables for HSL components
  const addTaskButtonStyle = (currentThemeHsl ? {
    '--current-accent-h': currentThemeHsl.h,
    '--current-accent-s': currentThemeHsl.s,
    '--current-accent-l': currentThemeHsl.l,
  } : {}) as any;

  return (
    <>
      <div className="h-20"></div> {/* Spacer */}
      <motion.div 
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-gray-800 shadow-lg z-50 transition-all duration-300 ease-in-out",
          showNav ? "translate-y-0" : "translate-y-full"
        )}
        initial={{ y: 100 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-2 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <motion.button
              style={addTaskButtonStyle}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
                currentThemeHsl && "bg-[hsl(var(--current-accent-h)_var(--current-accent-s)_var(--current-accent-l))]"
              )}
              whileHover={currentThemeHsl ? { 
                scale: 1.05, 
                boxShadow: `0 0 25px hsl(${currentThemeHsl.h} ${currentThemeHsl.s} ${currentThemeHsl.l} / 0.7)` 
              } : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddTaskModal(true)}
            >
              <Plus className="text-white h-7 w-7" />
            </motion.button>
          </div>
          
          <div className="flex justify-between items-center py-3">
            {navItems.map((item) => {
              const isActive = location === item.route || (item.mode && item.mode === mode);
              const itemSpecificTheme = item.mode ? getModeTheme(item.mode) : currentTheme;
              const itemHsl = parseHslString(itemSpecificTheme.accentHsl);

              const itemStyle = (itemHsl ? {
                '--item-accent-h': itemHsl.h,
                '--item-accent-s': itemHsl.s,
                '--item-accent-l': itemHsl.l,
              } : {}) as any;

              return (
                <Link 
                  key={item.route} 
                  href={item.route}
                  className="block py-1.5 px-3 touch-manipulation" 
                  style={itemStyle}
                  onClick={() => {
                    if (item.mode && setMode) {
                      setMode(item.mode as Mode);
                    }
                  }}
                >
                  <div 
                    className={cn(
                      "flex flex-col items-center transition-colors min-w-[60px]",
                      isActive && itemHsl
                        ? "text-[hsl(var(--item-accent-h)_var(--item-accent-s)_var(--item-accent-l))]"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "p-2.5 rounded-full transition-all",
                      isActive && itemHsl && "bg-[hsl(var(--item-accent-h)_var(--item-accent-s)_calc(var(--item-accent-l)_*_0.3))]"
                    )}>
                      {item.icon}
                    </div>
                    <span className={cn(
                      "text-xs mt-1.5 font-medium",
                      isActive && "font-semibold"
                    )}>
                      {item.label}
                    </span>
                    {isActive && itemHsl && (
                      <motion.div 
                        className={`h-1.5 w-1.5 rounded-full mt-1 bg-[hsl(var(--item-accent-h)_var(--item-accent-s)_var(--item-accent-l))]`}
                        layoutId="navIndicator"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}