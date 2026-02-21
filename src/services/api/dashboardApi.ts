import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
export const dashboardApi = {
  getStats: () => axiosInstance.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD),
};
