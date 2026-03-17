export const TransactionType = {
  Income: 0,
  Expense: 1,
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
    description?: string;
    merchant?: string;
    paymentMethod?: string;
    status: PaymentStatus; // Note: Backend uses 'status', not 'stats'
    tranactionDate: string; // Note: Backend has typo 'tranaction' instead of 'transaction'
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
    note?: string;
}

export interface CreateTransactionRequest {
    type: TransactionType;
    categoryId: string;
    amount: number;
    tranactionDate: string;
    status: PaymentStatus;
    description?: string;
    merchant?: string;
    paymentMethod?: string;
    note?: string;
    imageUrl?: string;
}

export interface UpdateTransactionRequest {
    type: TransactionType;
    categoryId: string;
    amount: number;
    tranactionDate: string; // Note: Backend typo
    status: PaymentStatus;
    description?: string;
    merchant?: string;
    paymentMethod?: string;
    note?: string;
    imageUrl?: string;
}

export interface TransactionListParams {
    type?: TransactionType | string;
    status?: PaymentStatus | string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
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