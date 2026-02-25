import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';

const { REPORTS } = API_CONFIG.ENDPOINTS.ADMIN;

export type ReportPeriod = '7d' | '30d' | '90d' | '6m' | '1y';

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  commission: number;
  [key: string]: unknown;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalCommission: number;
  avgBookingValue: number;
  revenueChange: number;
  avgChange: number;
}

export interface RevenueStats {
  revenueData: RevenueDataPoint[];
  summary: RevenueSummary;
}

export interface BookingsByStatus {
  name: string;
  value: number;
  color: string;
}

export interface BookingsByCategory {
  category: string;
  confirmed: number;
  pending: number;
  [key: string]: unknown;
}

export interface BookingStats {
  byStatus: BookingsByStatus[];
  byCategory: BookingsByCategory[];
  totalBookings: number;
}

export interface UserGrowthDataPoint {
  month: string;
  users: number;
  vendors: number;
  [key: string]: unknown;
}

export interface UserGrowthStats {
  growthData: UserGrowthDataPoint[];
}

export interface TopVendor {
  _id: string;
  name: string;
  bookings: number;
  revenue: number;
  rating: number;
}

export interface TopVendorsStats {
  vendors: TopVendor[];
}

export interface AllReportsData {
  revenue: RevenueStats;
  bookings: BookingStats;
  userGrowth: UserGrowthStats;
  topVendors: TopVendorsStats;
}

export const reportsApi = {
  getAll: (period: ReportPeriod = '6m') =>
    axiosInstance.get<{ data: AllReportsData }>(REPORTS.BASE, { params: { period } }),

  getRevenue: (period: ReportPeriod = '6m') =>
    axiosInstance.get<{ data: RevenueStats }>(REPORTS.REVENUE, { params: { period } }),

  getBookings: (period: ReportPeriod = '6m') =>
    axiosInstance.get<{ data: BookingStats }>(REPORTS.BOOKINGS, { params: { period } }),

  getUserGrowth: (period: ReportPeriod = '6m') =>
    axiosInstance.get<{ data: UserGrowthStats }>(REPORTS.USER_GROWTH, { params: { period } }),

  getTopVendors: (period: ReportPeriod = '6m', limit: number = 10) =>
    axiosInstance.get<{ data: TopVendorsStats }>(REPORTS.TOP_VENDORS, { params: { period, limit } }),
};
