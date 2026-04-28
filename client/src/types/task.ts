export type TaskStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TaskType = 'task' | 'bug' | 'feature';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string | null;
  issueType: TaskType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string | null;
  issueType?: TaskType;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  dueDate?: string | null;
  issueType?: TaskType;
}
