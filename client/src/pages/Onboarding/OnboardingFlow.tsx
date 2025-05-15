import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from 'wouter'; // Re-added for navigation

const OnboardingFlow: React.FC = () => {
  const { user, completeOnboarding, loading: authLoading } = useAuth();
  const [, navigate] = useLocation(); // For redirecting after onboarding
  const [isCompleting, setIsCompleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCompleteOnboarding = async () => {
    setIsCompleting(true);
    setErrorMessage(null);
    try {
      const { error } = await completeOnboarding();
      console.log('[OnboardingFlow] handleCompleteOnboarding: completeOnboarding() returned error:', error);
      if (error) {
        setErrorMessage(error.message || 'Failed to complete onboarding. Please try again.');
        console.error('Onboarding completion error:', error);
      } else {
        // On successful completion, redirect to the mode/mood selection page
        navigate('/mode-mood-select');
      }
      // App.tsx or ProtectedRoute will handle redirect based on onboardingCompleted state.
    } catch (e: any) {
      console.error('Unexpected error during onboarding completion:', e);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 sm:p-6 md:p-8 text-center bg-neutral-900 text-neutral-200">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6">Welcome, {user?.user_metadata?.full_name || 'Explorer'}!</h1>
        <p className="text-lg text-purple-300 mb-2">You're about to unlock your productivity potential.</p>
        <p className="text-neutral-300 mb-8">
          You're all set to bring order to your tasks and conquer your goals. Click the button below to launch into your personalized dashboard.
        </p>
        {/* Future onboarding steps could be added here */}
        {errorMessage && (
          <p className="text-sm text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <button 
          onClick={handleCompleteOnboarding}
          disabled={isCompleting || authLoading}
          className="w-full py-3 px-6 text-lg font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompleting ? (
            <svg className="animate-spin inline-block -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingFlow;
