import React from 'react';
import { Link, useLocation } from 'wouter'; // Using wouter for navigation
import { useAuth } from '@/context/AuthContext';
import { useOrbit } from '@/context/orbit-context';
import { Mode, getModeTheme } from '@/lib/utils';
import { CloudLightning, HeartPulse, Waves, Zap } from 'lucide-react'; // Added Zap as a fallback/default

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const { mode } = useOrbit();
  const [currentPath, navigate] = useLocation(); 

  const currentTheme = getModeTheme(mode);
  const modeAccentColor = `hsl(${currentTheme.accentHsl})`;

  const ModeIcon = React.useMemo(() => {
    switch (mode) {
      case 'build':
        return CloudLightning;
      case 'restore':
        return HeartPulse;
      case 'flow':
        return Waves;
      default:
        return Zap; // Default icon
    }
  }, [mode]);

  return (
    <header className="bg-background border-b border-border text-foreground py-4 px-8 sticky top-0 z-50">
      <nav className="flex justify-between items-center max-w-7xl mx-auto">
        <Link to="/" className="flex items-center">
          <ModeIcon className="h-8 w-8" style={{ color: modeAccentColor }} />
          <span className="font-semibold text-xl ml-2" style={{ color: modeAccentColor }}>Orbit</span> {/* Optional: Add App name next to icon */}
        </Link>
        <div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/dashboard' ? 'text-primary font-semibold bg-primary-foreground/10' : 'text-muted-foreground hover:text-primary'}`}>Dashboard</Link>
              <Link to="/tasks" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/tasks' ? 'text-primary font-semibold bg-primary-foreground/10' : 'text-muted-foreground hover:text-primary'}`}>Tasks</Link>
              <Link to="/settings" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/settings' ? 'text-primary font-semibold bg-primary-foreground/10' : 'text-muted-foreground hover:text-primary'}`}>Settings</Link>
              <Link to="/help" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/help' ? 'text-primary font-semibold bg-primary-foreground/10' : 'text-muted-foreground hover:text-primary'}`}>Help</Link>
              {/* <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/' ? 'text-purple-400 font-semibold bg-gray-800' : 'text-gray-300 hover:text-purple-300'}`}>Landing</Link> */}
              <button 
                onClick={() => { logout(); navigate('/'); }} 
                className="text-muted-foreground bg-transparent border border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium px-3 py-2 rounded-md ml-2"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login" className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/login' ? 'text-primary font-semibold bg-primary-foreground/10' : 'text-muted-foreground hover:text-primary'}`}>Log In</Link>
              <Link 
                to="/signup" 
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentPath === '/signup' ? 'bg-primary text-primary-foreground font-semibold' : 'bg-primary/90 text-primary-foreground hover:bg-primary'}`}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
