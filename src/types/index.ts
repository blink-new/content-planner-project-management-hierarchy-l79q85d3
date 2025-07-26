export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'manager' | 'editor' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  startDate?: string;
  endDate?: string;
  progress: number;
  budget?: number;
  spentBudget?: number;
  ownerId: string;
  teamMembers: string[];
  tags?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: 'planned' | 'active' | 'completed' | 'on_hold';
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contentType: 'general' | 'social_media' | 'blog' | 'video' | 'design' | 'meeting' | 'event';
  dueDate?: string;
  assignedTo?: string;
  projectId?: string;
  parentTaskId?: string;
  estimatedHours?: number;
  actualHours: number;
  tags?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Календарные поля
  calendarType: 'team' | 'personal' | 'shared';
  isAllDay: boolean;
  startTime?: string;
  endTime?: string;
  recurrenceRule?: string;
  isEvent: boolean;
  eventLocation?: string;
  attendees?: string;
  visibility: 'team' | 'private' | 'public';
  taskType: 'task' | 'event' | 'meeting' | 'milestone';
  storyPoints: number;
  parentEventId?: string;
  location?: string;
  meetingUrl?: string;
  calendarId?: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  assignedTo?: string;
  dueDate?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeEntry {
  id: string;
  taskId?: string;
  userId: string;
  description?: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  taskId?: string;
  name: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy: string;
  createdAt: string;
}

export interface CalendarView {
  id: string;
  userId: string;
  name: string;
  type: 'team' | 'personal' | 'shared' | 'project';
  filters?: string; // JSON string
  isDefault: boolean;
  createdAt: string;
}

export interface CalendarPermission {
  id: string;
  calendarViewId: string;
  userId: string;
  permissionLevel: 'view' | 'edit' | 'admin';
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'manager' | 'editor' | 'member';
  joinedAt: string;
}

export interface Comment {
  id: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'project_updated' | 'comment_added' | 'deadline_approaching';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface CalendarFilters {
  calendarType?: 'team' | 'personal' | 'shared' | 'all';
  status?: string[];
  priority?: string[];
  assignedTo?: string[];
  projects?: string[];
  contentTypes?: string[];
  showCompleted?: boolean;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalProjects: number;
  activeProjects: number;
  teamMembers: number;
  hoursLogged: number;
  completionRate: number;
}