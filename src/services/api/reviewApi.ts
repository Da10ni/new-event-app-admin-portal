import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';

export const reviewApi = {
  getAll: (params?: Record<string, unknown>) =>
    axiosInstance.get(API_CONFIG.ENDPOINTS.ADMIN.REVIEWS, { params }),
  getById: (id: string) =>
    axiosInstance.get(`${API_CONFIG.ENDPOINTS.ADMIN.REVIEWS}/${id}`),
  delete: (id: string) =>
    axiosInstance.delete(`${API_CONFIG.ENDPOINTS.ADMIN.REVIEWS}/${id}`),
  toggleVisibility: (id: string) =>
    axiosInstance.patch(`${API_CONFIG.ENDPOINTS.ADMIN.REVIEWS}/${id}/visibility`),
};
