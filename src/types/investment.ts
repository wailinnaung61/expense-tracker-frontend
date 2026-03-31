export const AssetType = {
  Stock: 0,
  Crypto: 1,
  Bond: 2,
  MutualFund: 3,
  RealEstate: 4,
  Gold: 5,
  Other: 6,
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export const InvestmentStatus = {
  Holding: 0,
  Sold: 1,
  PartialSold: 2,
} as const;

export type InvestmentStatus = (typeof InvestmentStatus)[keyof typeof InvestmentStatus];

export interface Investment {
  investmentId: string;
  userId: string;
  portfolioId: string | null;
  assetType: string;
  assetName: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  status: string;
  notes: string;
  imageUrl: string;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  returnPercentage: number;
  createdAt: string;
  updatedAt?: string;
}

export interface InvestmentPortfolio {
  portfolioId: string;
  userId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetAllocation {
  assetType: string;
  currentValue: number;
  percentage: number;
}

export interface InvestmentDashboard {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  returnPercentage: number;
  assetAllocation: AssetAllocation[];
  topPerformers: Investment[];
  worstPerformers: Investment[];
}

export interface CreateInvestmentRequest {
  portfolioId?: string;
  assetType: AssetType;
  assetName: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  notes?: string;
  imageUrl?: string;
}

export interface UpdateInvestmentRequest {
  portfolioId?: string;
  assetName: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
  status: InvestmentStatus;
  notes?: string;
  imageUrl?: string;
}

export interface InvestmentFilterParams {
  portfolioId?: string;
  assetType?: AssetType | string;
  status?: InvestmentStatus | string;
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

export interface CreateInvestmentPortfolioRequest {
  name: string;
  description?: string;
}

export interface UpdateInvestmentPortfolioRequest {
  name: string;
  description: string;
  isActive: boolean;
}


