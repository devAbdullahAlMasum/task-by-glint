import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({ user: userData, loading: false });
          } else {
            throw new Error('User data not found');
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      signUp: async (email: string, password: string, name: string) => {
        try {
          set({ loading: true, error: null });
          
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Create user document in Firestore
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name,
            role: 'developer',
            createdAt: new Date(),
            updatedAt: new Date(),
            settings: {
              theme: 'light',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              notifications: {
                email: true,
                push: true,
                mentions: true,
                taskUpdates: true,
              },
            },
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          set({ user: newUser, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          await signOut(auth);
          set({ user: null, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateUser: async (updates: Partial<User>) => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user logged in');
          
          set({ loading: true, error: null });
          
          const updatedUser = {
            ...user,
            ...updates,
            updatedAt: new Date(),
          };
          
          await updateDoc(doc(db, 'users', user.id), updatedUser);
          set({ user: updatedUser, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      initializeAuth: async () => {
        return new Promise((resolve) => {
          set({ loading: true });
          
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
              try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User;
                  set({ user: userData, loading: false });
                } else {
                  set({ user: null, loading: false });
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
                set({ user: null, loading: false });
              }
            } else {
              set({ user: null, loading: false });
            }
            
            resolve();
          });
          
          // Return unsubscribe function
          return unsubscribe;
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);