import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
export const bookingApi = {
  getAll: (params?: Record<string, unknown>) => axiosInstance.get(API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS, { params }),
  getById: (id: string) => axiosInstance.get(`${API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS}/${id}`),
};
