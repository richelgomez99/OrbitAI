import React from 'react';
import { useAuth } from '@/context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="p-6 bg-neutral-900 min-h-screen text-white">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Settings</h1>
        <p className="text-neutral-400 mt-1">Manage your account and application preferences.</p>
      </header>

      <div className="space-y-12 max-w-2xl mx-auto">
        {/* Account Information Section */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-200 border-b border-neutral-700 pb-3 mb-6">Account Information</h2>
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700">
            {user ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-neutral-400">Full Name</label>
                  <p className="text-neutral-100 mt-1">{user.user_metadata?.full_name || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-400">Email</label>
                  <p className="text-neutral-100 mt-1">{user.email}</p>
                </div>
                {/* Add more user details if available and relevant */}
                <button 
                  onClick={logout}
                  className="mt-4 w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <p className="text-neutral-400">Loading user information...</p>
            )}
          </div>
        </section>

        {/* Theme Settings Placeholder */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-200 border-b border-neutral-700 pb-3 mb-6">Appearance</h2>
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700">
            <p className="text-neutral-400">Theme settings (e.g., Light/Dark mode toggle) will be available here in a future update.</p>
            {/* Example: <Toggle label="Dark Mode" /> */}
          </div>
        </section>

        {/* Notification Settings Placeholder */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-200 border-b border-neutral-700 pb-3 mb-6">Notifications</h2>
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700">
            <p className="text-neutral-400">Notification preferences will be managed here soon.</p>
            {/* Example: <Checkbox label="Email Notifications" /> */}
          </div>
        </section>

        {/* Data Management Placeholder */}
        <section>
          <h2 className="text-2xl font-semibold text-neutral-200 border-b border-neutral-700 pb-3 mb-6">Data Management</h2>
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg border border-neutral-700">
            <p className="text-neutral-400">Options for exporting or managing your data will appear here.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
