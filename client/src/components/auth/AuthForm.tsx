import React, { useState } from 'react';

interface AuthFormProps {
  formType: 'login' | 'signup';
  onSubmit: (data: Record<string, string>) => void;
  isLoading?: boolean;
  errorMessage?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit, isLoading = false, errorMessage = null }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for signup

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData: Record<string, string> = { email, password };
    if (formType === 'signup') {
      formData.name = name;
    }
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-900 p-4">
      <div className="w-full max-w-md bg-neutral-800 shadow-xl rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">{formType === 'login' ? 'Log In to Orbit' : 'Sign Up for Orbit'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
      {formType === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-300">Name</label>
          <input 
            type="text" 
            id="name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="Your Name"
          />
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-300">Email address</label>
        <input 
          type="email" 
          id="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-300">Password</label>
        <input 
          type="password" 
          id="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          minLength={formType === 'signup' ? 6 : undefined} // Example: min length for signup
          className="mt-1 block w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          placeholder={formType === 'signup' ? "6+ characters" : "Your Password"}
        />
      </div>
      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}
      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 transform hover:scale-105"
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : formType === 'login' ? 'Log In' : 'Sign Up'}
      </button>
      {formType === 'login' && <p className="mt-4 text-center text-sm text-neutral-400"><a href="#" className="font-medium text-purple-400 hover:text-purple-300">Forgot password?</a> (placeholder)</p>}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
