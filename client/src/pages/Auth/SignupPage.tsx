import React, { useState } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { Redirect, useLocation } from 'wouter';

const SignupPage: React.FC = () => {
  const { signup, isAuthenticated, loading, user, onboardingCompleted } = useAuth();
  const [, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If authenticated and onboarded, go to app.
  // If authenticated but not onboarded, go to onboarding.
  // The loading check prevents premature redirect.
  if (!loading && isAuthenticated && user) {
    if (onboardingCompleted) {
      return <Redirect to="/app" />;
    } else {
      // This case should ideally be handled by AuthContext redirecting to /onboarding
      // upon signup if onboarding is not complete. But as a fallback:
      return <Redirect to="/onboarding" />;
    }
  }

  const handleSignup = async (formData: Record<string, string>) => {
    setErrorMessage(null);
    if (!formData.email || !formData.password || !formData.name) {
      setErrorMessage('Name, email, and password are required.');
      return;
    }
    if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
    }

    try {
      const { error } = await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name, // Pass the name to the signup function
      });

      if (error) {
        console.error('Signup failed:', error.message);
        setErrorMessage(error.message || 'Signup failed. Please try again.');
      } else {
        // Successful signup: onAuthStateChange in AuthContext will update isAuthenticated.
        // AuthContext's onAuthStateChange should redirect to /onboarding if onboarding is not complete.
        // No explicit setLocation('/onboarding') needed here as AuthContext handles it.
      }
    } catch (error: any) {
      console.error('An unexpected error occurred during signup:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    // The AuthForm component now handles its own padding and layout
    <AuthForm 
      formType="signup" 
      onSubmit={handleSignup} 
      isLoading={loading}
      errorMessage={errorMessage}
    />
  );
};

export default SignupPage;
