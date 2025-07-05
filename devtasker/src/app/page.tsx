'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user, loading, initializeAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Marketing content */}
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Project Management for 
            <span className="text-blue-600 dark:text-blue-400"> Developers</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Streamline your development workflow with powerful project management tools designed specifically for engineering teams.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-lg">📋</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Kanban Boards</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Visualize your workflow with drag-and-drop task management</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-lg">⚡</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Sprint Planning</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Plan and track sprints with velocity metrics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-lg">⏱️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Time Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Track time spent on tasks and generate reports</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-lg">🔗</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">GitHub Integration</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Connect with your code repositories seamlessly</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="lg:max-w-md lg:mx-auto w-full">
          <AuthForm mode={authMode} onToggleMode={toggleAuthMode} />
        </div>
      </div>
    </div>
  );
}
