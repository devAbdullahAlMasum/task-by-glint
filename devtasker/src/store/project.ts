import { create } from 'zustand';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Project, Task, CreateProjectForm, CreateTaskForm, TaskFilters } from '@/types';

interface ProjectStore {
  // State
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;

  // Actions
  fetchProjects: (teamId: string) => Promise<void>;
  fetchProject: (projectId: string) => Promise<void>;
  createProject: (projectData: CreateProjectForm, teamId: string, userId: string) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Task actions
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (taskData: CreateTaskForm, projectId: string, userId: string) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: string, newPosition: number) => Promise<void>;
  
  // Filters
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultColumns = [
  { id: 'backlog', title: 'Backlog', position: 0, color: '#94a3b8' },
  { id: 'todo', title: 'To Do', position: 1, color: '#3b82f6' },
  { id: 'in-progress', title: 'In Progress', position: 2, color: '#f59e0b' },
  { id: 'review', title: 'Review', position: 3, color: '#8b5cf6' },
  { id: 'done', title: 'Done', position: 4, color: '#10b981' }
];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  tasks: [],
  loading: false,
  error: null,
  filters: {},

  fetchProjects: async (teamId: string) => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'projects'),
        where('teamId', '==', teamId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        startDate: doc.data().startDate?.toDate(),
        endDate: doc.data().endDate?.toDate(),
      })) as Project[];
      
      set({ projects, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const project = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          startDate: docSnap.data().startDate?.toDate(),
          endDate: docSnap.data().endDate?.toDate(),
        } as Project;
        
        set({ currentProject: project, loading: false });
      } else {
        throw new Error('Project not found');
      }
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createProject: async (projectData: CreateProjectForm, teamId: string, userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const newProject = {
        ...projectData,
        teamId,
        ownerId: userId,
        status: 'planning' as const,
        priority: 'medium' as const,
        members: [userId, ...projectData.members],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        settings: {
          columns: defaultColumns,
          isPublic: projectData.isPublic,
          allowClientAccess: projectData.allowClientAccess,
        },
      };
      
      const docRef = await addDoc(collection(db, 'projects'), newProject);
      
      const createdProject = {
        id: docRef.id,
        ...newProject,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Project;
      
      set(state => ({
        projects: [createdProject, ...state.projects],
        loading: false
      }));
      
      return createdProject;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProject: async (projectId: string, updates: Partial<Project>) => {
    try {
      set({ loading: true, error: null });
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(doc(db, 'projects', projectId), updateData);
      
      set(state => ({
        projects: state.projects.map(p => 
          p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
        ),
        currentProject: state.currentProject?.id === projectId 
          ? { ...state.currentProject, ...updates, updatedAt: new Date() }
          : state.currentProject,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteProject: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      // Delete project and all its tasks
      const batch = writeBatch(db);
      
      // Delete project
      batch.delete(doc(db, 'projects', projectId));
      
      // Delete all tasks in the project
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      
      tasksSnapshot.docs.forEach(taskDoc => {
        batch.delete(taskDoc.ref);
      });
      
      await batch.commit();
      
      set(state => ({
        projects: state.projects.filter(p => p.id !== projectId),
        currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
        tasks: state.tasks.filter(t => t.projectId !== projectId),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project });
  },

  fetchTasks: async (projectId: string) => {
    try {
      set({ loading: true, error: null });
      
      const q = query(
        collection(db, 'tasks'),
        where('projectId', '==', projectId),
        orderBy('position', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        completedDate: doc.data().completedDate?.toDate(),
        comments: doc.data().comments || [],
        attachments: doc.data().attachments || [],
        timeTracking: doc.data().timeTracking || { estimated: 0, logged: 0, remaining: 0 },
      })) as Task[];
      
      set({ tasks, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  createTask: async (taskData: CreateTaskForm, projectId: string, userId: string) => {
    try {
      set({ loading: true, error: null });
      
      const newTask = {
        ...taskData,
        projectId,
        reporterId: userId,
        status: 'backlog',
        position: Date.now(), // Simple position system
        tags: taskData.tags || [],
        comments: [],
        attachments: [],
        timeTracking: { estimated: 0, logged: 0, remaining: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      
      const createdTask = {
        id: docRef.id,
        ...newTask,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Task;
      
      set(state => ({
        tasks: [...state.tasks, createdTask],
        loading: false
      }));
      
      return createdTask;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    try {
      set({ loading: true, error: null });
      
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(doc(db, 'tasks', taskId), updateData);
      
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      set({ loading: true, error: null });
      
      await deleteDoc(doc(db, 'tasks', taskId));
      
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  moveTask: async (taskId: string, newStatus: string, newPosition: number) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus,
        position: newPosition,
        updatedAt: serverTimestamp(),
      });
      
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId 
            ? { ...t, status: newStatus, position: newPosition, updatedAt: new Date() }
            : t
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  setFilters: (filters: TaskFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));