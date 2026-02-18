'use client';

import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetPasswordForm from './ResetPasswordForm';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register' | 'reset'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      {view === 'login' && (
        <LoginForm
          onSwitchToRegister={() => setView('register')}
          onSwitchToReset={() => setView('reset')}
        />
      )}
      {view === 'register' && (
        <RegisterForm onSwitchToLogin={() => setView('login')} />
      )}
      {view === 'reset' && (
        <ResetPasswordForm onSwitchToLogin={() => setView('login')} />
      )}
    </div>
  );
}
