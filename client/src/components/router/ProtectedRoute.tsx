import React from 'react';
import { Route, Redirect, RouteProps, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

// Extend RouteProps to accept 'component' as a React.ComponentType
interface ProtectedRouteProps extends Omit<RouteProps, 'component'> {
  component: React.ComponentType<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, onboardingCompleted, loading } = useAuth(); // Added loading
  const [location] = useLocation();
  console.log('[ProtectedRoute] Rendering. Location:', location, 'Loading:', loading, 'IsAuthenticated:', isAuthenticated, 'OnboardingCompleted:', onboardingCompleted);

  if (loading) {
    // Optional: Render a global loading spinner or a minimal placeholder
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900">
        <p className="text-white text-lg">Loading...</p> 
        {/* Consider adding a spinner SVG here if you have a standard one */}
      </div>
    );
  }

  if (isAuthenticated) {
    if (onboardingCompleted) {
      // User is authenticated and onboarding is complete
      if (location === '/onboarding' || location === '/login' || location === '/signup') {
        // If they are on onboarding, login, or signup page, redirect to the main app page
        return <Redirect to="/app" />;
      }
      // Otherwise, they are accessing a valid app route (or the component for the current path)
      return <Route {...rest} component={Component} />;
    } else {
      // User is authenticated but onboarding is NOT complete
      if (location !== '/onboarding') {
        // If not on the onboarding page, redirect them to it
        return <Redirect to="/onboarding" />;
      }
      // Allow access to /onboarding page
      return <Route {...rest} component={Component} />;
    }
  } else {
    // User is NOT authenticated
    // Allow access to public pages like login, signup, and landing page
    const publicPaths = ['/login', '/signup', '/']; // Add any other public paths here
    if (publicPaths.includes(location)) {
       return <Route {...rest} component={Component} />;
    }
    // For any other path, redirect to login
    return <Redirect to="/login" />;
  }

};

export default ProtectedRoute;
