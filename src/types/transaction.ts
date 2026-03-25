export const TransactionType = {
  Income: 0,
  Expense: 1,
  Investment: 2,
  Savings: 3,
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentStatus = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Transaction {
    tranactionId: string; // Note: Backend has typo 'tranaction' instead of 'transaction'
    userId: string;
    type: TransactionType;
    categoryId: string;
    categoryName: string;
    amount: number;
    description: string;
    merchant: string;
    paymentMethod: string;
    status: PaymentStatus;
    tranactionDate: string; // Note: Backend has typo 'tranaction' instead of 'transaction'
    imageUrl: string;
    createdAt: string;
    updatedAt?: string; // Nullable in backend: DateTime?
    note: string;
}

export interface CreateTransactionRequest {
    type: TransactionType;
    categoryId: string;
    amount: number;
    tranactionDate: string;
    status: PaymentStatus;
    description: string;
    note: string;
    imageUrl: string;
}

export interface UpdateTransactionRequest {
    type: TransactionType;
    categoryId: string;
    amount: number;
    tranactionDate: string;
    status: PaymentStatus;
    description: string;
    note: string;
    imageUrl: string;
}

// Backend: TransactionFilterRequest - cursor-based pagination
export interface TransactionListParams {
    startDate?: string; // Backend: DateTime?
    endDate?: string; // Backend: DateTime?
    type?: TransactionType | string; // Backend: AppConstants.TransactionType?
    status?: PaymentStatus | string; // Backend: AppConstants.PaymentStatus?
    categoryId?: string; // Backend: Guid?
    keyword?: string;
    pageSize?: number; // Backend: int = 10
    cursor?: string; // Backend: DateTime? Cursor
    cursorId?: string; // Backend: Guid? CursorId
    // Legacy pagination support (for backward compatibility)
    pagination?: {
        pageNumber?: number;
        pageSize?: number;
        nextPageToken?: string;
        hasCursor?: boolean;
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
    nextPageToken?: string; // Legacy
    previousPageToken?: string; // Legacy
    nextCursor?: string; // Backend: DateTime? cursor for next page
    nextCursorId?: string; // Backend: Guid? cursor ID for next page
}