import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage/LandingPage";
import DailyFlowHub from "@/pages/daily-flow-hub";
import DashboardView from "@/pages/dashboard-view";
import ReflectionView from "@/pages/reflection-view";
import ChatView from "@/pages/chat-view";
import SignupPage from "@/pages/Auth/SignupPage";
import LoginPage from "@/pages/Auth/LoginPage";
import AppPage from "@/pages/App/AppPage";
import OnboardingFlow from "./pages/Onboarding/OnboardingFlow";
import ModeSwitcher from "@/components/dashboard/ModeSwitcher"; // Import ModeSwitcher
import ModeMoodSelectionPage from '@/pages/ModeMoodSelectionPage'; // Added import
import TasksPage from "@/pages/TasksPage";
import SettingsPage from "@/pages/SettingsPage";
import HelpPage from "@/pages/HelpPage";
import { StickyBottomNav } from "@/components/sticky-bottom-nav";
import MainLayout from "@/components/layout/MainLayout";
import { useOrbit, OrbitProvider } from "@/context/orbit-context";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react"; // Keep only one useState import
import { useLocation } from "wouter";
import AddTaskModal from "@/components/add-task-modal";
import ProtectedRoute from "@/components/router/ProtectedRoute";


const HomeOrApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  // console.log('HomeOrApp: isAuthenticated', isAuthenticated); // For debugging
  if (isAuthenticated) {
    return <Redirect to="/app" />;
  }
  return <LandingPage />;
};

function AppRoutes() {
  const { started, showAppNavigation, setShowAppNavigation } = useOrbit();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated for conditional rendering
  const [location] = useLocation();
  // const [activeMode, setActiveMode] = useState<DashboardMode>('Build'); // Removed local state
  // const handleModeChange = (mode: DashboardMode) => { // Removed handler
  //   setActiveMode(mode);
  //   console.log("Active mode changed to:", mode);
  // };
  
  useEffect(() => {
    // Only show navigation if app is started, authenticated, and not on a public page like landing, login, or signup
    const publicPaths = ["/", "/login", "/signup"];
    setShowAppNavigation(started && isAuthenticated && !publicPaths.includes(location));
  }, [started, location, isAuthenticated, setShowAppNavigation]);

  return (
    <>
      <Switch>
        <Route path="/" component={HomeOrApp} />
        <ProtectedRoute path="/build" component={DashboardView} />
        <Route path="/flow" component={DailyFlowHub} />
        <ProtectedRoute path="/restore" component={DashboardView} />
        <ProtectedRoute path="/dashboard" component={DashboardView} />
        <Route path="/reflect" component={ReflectionView} />
        <Route path="/chat" component={ChatView} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/login" component={LoginPage} />
        <ProtectedRoute path="/app" component={AppPage} />
        <ProtectedRoute path="/onboarding" component={OnboardingFlow} />
        <ProtectedRoute path="/mode-mood-select" component={ModeMoodSelectionPage} />
        <ProtectedRoute path="/tasks" component={TasksPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/help" component={HelpPage} />
        <Route component={NotFound} />
      </Switch>
      
      {showAppNavigation && <StickyBottomNav />}
      <AddTaskModal />
      {isAuthenticated && location.startsWith('/dashboard') && <ModeSwitcher />} {/* ModeSwitcher now uses context */}
    </>
  );
}

function App() {
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  // console.log('Current Vite Mode:', import.meta.env.MODE); // 'development' or 'production'
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrbitProvider>
          <TooltipProvider>
          <Toaster />
          <MainLayout>
            <AppRoutes />
          </MainLayout>
          <ModeSwitcher /> {/* Render ModeSwitcher globally if it's a modal type component */}
          {/* Redundant Toaster removed, one is enough */}
          </TooltipProvider>
        </OrbitProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
