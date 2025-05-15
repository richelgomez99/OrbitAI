import React, { useState } from 'react'; // Added useState for error messages
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/context/AuthContext';
import { Redirect, useLocation } from 'wouter';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, loading, user } = useAuth(); // Added loading and user
  const [, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated and user object exists, redirect to /app
  // The loading check prevents premature redirect before auth state is confirmed by Supabase
  if (!loading && isAuthenticated && user) {
    return <Redirect to="/app" />;
  }

  const handleLogin = async (formData: Record<string, string>) => {
    setErrorMessage(null); // Clear previous errors
    if (!formData.email || !formData.password) {
      setErrorMessage('Email and password are required.');
      return;
    }
    try {
      const { error } = await login({ 
        email: formData.email,
        password: formData.password 
      });

      if (error) {
        console.error('Login failed:', error.message);
        setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      } else {
        // Successful login: onAuthStateChange in AuthContext will update isAuthenticated.
        // Redirect is handled by the effect checking isAuthenticated or by ProtectedRoute.
        // No explicit setLocation('/app') needed here as AuthContext drives state.
        // However, if user is already authenticated, the redirect above handles it.
        // If login is successful, onAuthStateChange will trigger a rerender,
        // and the redirect condition at the top should then apply.
      }
    } catch (error: any) {
      console.error('An unexpected error occurred during login:', error);
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <AuthForm 
        formType="login" 
        onSubmit={handleLogin} 
        isLoading={loading} 
        errorMessage={errorMessage} 
      />
    </div>
  );
};

export default LoginPage;
