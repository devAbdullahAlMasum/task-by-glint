export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'pm' | 'developer' | 'client';
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    theme: 'light' | 'dark';
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      mentions: boolean;
      taskUpdates: boolean;
    };
  };
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: string[]; // User IDs
  ownerId: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
  settings: {
    defaultTaskStatus: string[];
    sprintDuration: number;
    timezone: string;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  ownerId: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
  members: string[]; // User IDs
  tags: string[];
  color: string;
  createdAt: Date;
  updatedAt: Date;
  settings: {
    columns: ProjectColumn[];
    isPublic: boolean;
    allowClientAccess: boolean;
  };
}

export interface ProjectColumn {
  id: string;
  title: string;
  position: number;
  color: string;
  wipLimit?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  status: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'story' | 'bug' | 'feature' | 'epic' | 'task';
  storyPoints?: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  parentId?: string; // For subtasks
  sprintId?: string;
  tags: string[];
  position: number;
  createdAt: Date;
  updatedAt: Date;
  attachments: Attachment[];
  comments: Comment[];
  timeTracking: {
    estimated: number; // minutes
    logged: number; // minutes
    remaining: number; // minutes
  };
}

export interface Sprint {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  goal?: string;
  tasks: string[]; // Task IDs
  createdAt: Date;
  updatedAt: Date;
  metrics: {
    totalStoryPoints: number;
    completedStoryPoints: number;
    totalTasks: number;
    completedTasks: number;
  };
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  duration: number; // minutes
  description?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
  billable: boolean;
  invoiceId?: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  mentions: string[]; // User IDs
  parentId?: string; // For replies
}

export interface Attachment {
  id: string;
  taskId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'task-assigned' | 'task-updated' | 'comment' | 'sprint-started' | 'sprint-ended';
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'task' | 'project' | 'sprint' | 'team';
  entityId: string;
  details: Record<string, any>;
  createdAt: Date;
}

// UI Types
export interface TaskFilters {
  status?: string[];
  assignee?: string[];
  priority?: string[];
  type?: string[];
  sprint?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  activeProjects: number;
  activeSprints: number;
  teamMembers: number;
  timeLoggedToday: number;
  timeLoggedThisWeek: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  wipLimit?: number;
}

// Form Types
export interface CreateProjectForm {
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  members: string[];
  tags: string[];
  color: string;
  isPublic: boolean;
  allowClientAccess: boolean;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'story' | 'bug' | 'feature' | 'epic' | 'task';
  storyPoints?: number;
  dueDate?: Date;
  tags: string[];
  sprintId?: string;
}

export interface CreateSprintForm {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  goal?: string;
}

export interface TimeEntryForm {
  taskId: string;
  duration: number;
  description?: string;
  date: Date;
  billable: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Store Types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
}

export interface SprintState {
  sprints: Sprint[];
  currentSprint: Sprint | null;
  loading: boolean;
  error: string | null;
}

export interface TeamState {
  team: Team | null;
  members: User[];
  loading: boolean;
  error: string | null;
}