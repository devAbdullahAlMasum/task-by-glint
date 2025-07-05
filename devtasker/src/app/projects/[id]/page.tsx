'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useProjectStore } from '@/store/project';
import Layout from '@/components/Layout';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { Loader2 } from 'lucide-react';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { currentProject, fetchProject, loading: projectLoading } = useProjectStore();
  
  const projectId = params.id as string;

  useEffect(() => {
    if (!user && !authLoading) {
      router.push('/');
      return;
    }

    if (projectId && user) {
      fetchProject(projectId);
    }
  }, [user, authLoading, projectId, fetchProject, router]);

  if (authLoading || projectLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentProject) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Project not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The project you're looking for doesn't exist or you don't have access to it.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-full">
        <KanbanBoard projectId={projectId} />
      </div>
    </Layout>
  );
}