import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { CATEGORIES } = API_CONFIG.ENDPOINTS.ADMIN;
export const categoryApi = {
  getAll: () => axiosInstance.get(API_CONFIG.ENDPOINTS.CATEGORIES.BASE),
  create: (data: { name: string; description?: string; sortOrder?: number }) => axiosInstance.post(CATEGORIES, data),
  update: (id: string, data: Record<string, unknown>) => axiosInstance.patch(`${CATEGORIES}/${id}`, data),
  delete: (id: string) => axiosInstance.delete(`${CATEGORIES}/${id}`),
};
