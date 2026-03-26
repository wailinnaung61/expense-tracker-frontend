export const TransactionType = {
  Income: 0,
  Expense: 1,
  Investment: 2,
  Savings: 3,
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export interface ExpenseCategory {
  categoryId: string;
  displayName: string;
  displayNameLower?: string;
  type: TransactionType;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  displayName: string;
  type: TransactionType;
  icon: string;
  color: string;
}

export interface UpdateCategoryRequest {
  displayName: string;
  icon: string;
  color: string;
}

export interface CategoryListParams {
  startDate?: string;
  endDate?: string;
  type?: TransactionType | string;
  categoryId?: string;
  keyword?: string;
  isActive?: boolean;
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
