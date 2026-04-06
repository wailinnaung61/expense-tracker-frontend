export const SavingGoalStatus = {
  Active: 0,
  Completed: 1,
  Cancelled: 2,
} as const;

export type SavingGoalStatus = (typeof SavingGoalStatus)[keyof typeof SavingGoalStatus];

export const SavingGoalType = {
  EmergencyFund: "EmergencyFund",
  Vacation: "Vacation",
  Vehicle: "Vehicle",
  Home: "Home",
  Education: "Education",
  Retirement: "Retirement",
  Other: "Other",
} as const;

export type SavingGoalType = (typeof SavingGoalType)[keyof typeof SavingGoalType];

export const SavingTransactionType = {
  Deposit: 0,
  Withdrawal: 1,
} as const;

export type SavingTransactionType = (typeof SavingTransactionType)[keyof typeof SavingTransactionType];

export interface SavingGoal {
  savingGoalId: string;
  userId: string;
  goalName: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  targetDate: string;
  status: string;
  SavingGoalType?: string;
  notes: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SavingGoalContribution {
  contributionId: string;
  savingGoalId: string;
  type: string;
  amount: number;
  contributionDate: string;
  notes: string;
  createdAt: string;
}

export interface SavingDashboard {
  totalSaved: number;
  totalTarget: number;
  overallProgressPercentage: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  goals: SavingGoal[];
  top5Goals: SavingGoal[];
}

export interface CreateSavingGoalRequest {
  goalName: string;
  targetAmount: number;
  targetDate: string;
  savingGoalType?: string;
  description?: string;
  notes?: string;
  icon?: string;
  color?: string;
}

export interface UpdateSavingGoalRequest {
  goalName: string;
  targetAmount: number;
  targetDate: string;
  status?: SavingGoalStatus;
  savingGoalType?: string;
  description?: string;
  notes?: string;
  icon?: string;
  color?: string;
}

export interface AddSavingContributionRequest {
  type: SavingTransactionType;
  amount: number;
  contributionDate: string;
  notes?: string;
}

export interface SavingGoalFilterParams {
  status?: SavingGoalStatus | string;
  goalType?: SavingGoalType | string;
  keyword?: string;
  pageSize?: number;
  cursor?: string;
  cursorId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  nextCursor?: string;
  nextCursorId?: string;
}
