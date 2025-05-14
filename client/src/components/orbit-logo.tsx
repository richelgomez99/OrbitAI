import { motion } from "framer-motion";

interface OrbitLogoProps {
  size?: number;
  className?: string;
}

export function OrbitLogo({ size = 80, className = "" }: OrbitLogoProps) {
  return (
    <motion.div
      className={`flex items-center justify-center ${className}`}
      initial={{ opacity: 0.9, scale: 1 }}
      animate={{ opacity: 1, scale: 1.05 }}
      transition={{
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M40 0C46.4 0 52.3 1.2 57.7 3.5C63.1 5.8 67.8 9 71.7 13C75.6 17 78.6 21.7 80.5 27.1C82.4 32.5 83 38.4 82.2 44.3C81.4 50.2 79.3 55.5 75.8 60.2C72.3 64.9 67.8 68.6 62.3 71.3C56.8 74 50.8 75.4 44.3 75.4C37.8 75.4 31.8 74 26.3 71.3C20.8 68.6 16.3 64.9 12.8 60.2C9.3 55.5 7.2 50.2 6.4 44.3C5.6 38.4 6.2 32.5 8.1 27.1C10 21.7 13 17 16.9 13C20.8 9 25.5 5.8 30.9 3.5C36.3 1.2 42.2 0 48.6 0" 
          stroke="url(#gradient)" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#B2F5EA"/>
            <stop offset="50%" stopColor="#76E4F7"/>
            <stop offset="100%" stopColor="#9F7AEA"/>
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}
