import { apiClient } from '@/lib/api';
import type {
  DailyAggregation,
  WeeklyAggregation,
  MonthlyAggregation,
  YearlyAggregation,
  CategoryMonthlyAggregation,
  ExpenseBreakdown,
  CustomDateAggregationResponse,
} from '@/types/aggregation';

export const aggregationService = {
  // Daily Aggregations
  async getDailyAggregation(date: string): Promise<DailyAggregation> {
    return apiClient.get<DailyAggregation>(`/api/Aggregation/daily/${date}`);
  },

  async getDailyAggregations(startDate: string, endDate: string): Promise<DailyAggregation[]> {
    return apiClient.get<DailyAggregation[]>('/api/Aggregation/daily', {
      startDate,
      endDate,
    });
  },

  // Weekly Aggregations
  async getWeeklyAggregation(week: string): Promise<WeeklyAggregation> {
    return apiClient.get<WeeklyAggregation>(`/api/Aggregation/weekly/${week}`);
  },

  async getWeeklyAggregations(startWeek: string, endWeek: string): Promise<WeeklyAggregation[]> {
    return apiClient.get<WeeklyAggregation[]>('/api/Aggregation/weekly', {
      startWeek,
      endWeek,
    });
  },

  // Monthly Aggregations
  async getMonthlyAggregation(month: string): Promise<MonthlyAggregation> {
    return apiClient.get<MonthlyAggregation>(`/api/Aggregation/monthly/${month}`);
  },

  async getMonthlyAggregations(startMonth: string, endMonth: string): Promise<MonthlyAggregation[]> {
    return apiClient.get<MonthlyAggregation[]>('/api/Aggregation/monthly', {
      startMonth,
      endMonth,
    });
  },

  // Yearly Aggregations
  async getYearlyAggregation(year: string): Promise<YearlyAggregation> {
    return apiClient.get<YearlyAggregation>(`/api/Aggregation/yearly/${year}`);
  },

  async getYearlyAggregations(startYear: string, endYear: string): Promise<YearlyAggregation[]> {
    return apiClient.get<YearlyAggregation[]>('/api/Aggregation/yearly', {
      startYear,
      endYear,
    });
  },

  // Category Aggregations
  async getCategoryMonthlyAggregations(month: string): Promise<CategoryMonthlyAggregation[]> {
    return apiClient.get<CategoryMonthlyAggregation[]>(`/api/Aggregation/category/monthly/${month}`);
  },

  // Expense Breakdown
  async getExpenseBreakdown(month: string): Promise<ExpenseBreakdown> {
    return apiClient.get<ExpenseBreakdown>(`/api/Aggregation/expense-breakdown/${month}`);
  },

  async getExpenseBreakdownByRange(startDate: string, endDate: string): Promise<ExpenseBreakdown> {
    return apiClient.get<ExpenseBreakdown>('/api/Aggregation/expense-breakdown', {
      startDate,
      endDate,
    });
  },

  async getCustomDateAggregation(
    startDate: string,
    endDate: string
  ): Promise<CustomDateAggregationResponse> {
    return apiClient.get<CustomDateAggregationResponse>('/api/Aggregation/custom', {
      startDate,
      endDate,
    });
  },
};
