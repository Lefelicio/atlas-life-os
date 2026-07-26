export type ProjectStatus = "active" | "completed" | "archived";

export interface Project {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt" | "archived"> & {
  archived?: boolean;
};

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "baixa" | "media" | "alta";

export interface Task {
  id: string;
  projectId?: string;
  objetivoId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskInput = Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">;
