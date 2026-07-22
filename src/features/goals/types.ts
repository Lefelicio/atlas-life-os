export interface Goal {
  id: string;
  title: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // ISO date
  color: string;
  isPrimary: boolean;
  archived: boolean;
  createdAt: string;
}

export type GoalInput = Omit<Goal, "id" | "createdAt">;
