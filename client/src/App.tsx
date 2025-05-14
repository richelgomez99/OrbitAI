import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import DailyFlowHub from "@/pages/daily-flow-hub";
import DashboardView from "@/pages/dashboard-view";
import ReflectionView from "@/pages/reflection-view";
import ChatView from "@/pages/chat-view";
import AppNavigation from "@/components/app-navigation";
import { useOrbit, OrbitProvider } from "@/context/orbit-context";
import { useEffect } from "react";
import { useLocation } from "wouter";
import AddTaskModal from "@/components/add-task-modal";
import ModeSwitcher from "@/components/mode-switcher";

function AppRoutes() {
  const { started, showAppNavigation, setShowAppNavigation } = useOrbit();
  const [location] = useLocation();
  
  useEffect(() => {
    // Only show navigation if app is started and not on landing page
    setShowAppNavigation(started && location !== "/");
  }, [started, location, setShowAppNavigation]);

  return (
    <>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/flow" component={DailyFlowHub} />
        <Route path="/dashboard" component={DashboardView} />
        <Route path="/reflect" component={ReflectionView} />
        <Route path="/chat" component={ChatView} />
        <Route component={NotFound} />
      </Switch>
      
      {showAppNavigation && <AppNavigation />}
      <AddTaskModal />
      <ModeSwitcher />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <OrbitProvider>
        <TooltipProvider>
          <Toaster />
          <div className="orbit-app">
            <AppRoutes />
          </div>
        </TooltipProvider>
      </OrbitProvider>
    </QueryClientProvider>
  );
}

export default App;
