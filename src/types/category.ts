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
  displayNameLower: string;
  type: TransactionType;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  type?: TransactionType | string;
  keyword?: string;
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  nextPageToken?: string;
  previousPageToken?: string;
}
