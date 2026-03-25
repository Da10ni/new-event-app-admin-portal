import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { LISTINGS } = API_CONFIG.ENDPOINTS.ADMIN;
export const listingApi = {
  getAll: (params?: Record<string, unknown>) => axiosInstance.get(LISTINGS, { params }),
  getById: (id: string) => axiosInstance.get(`${LISTINGS}/${id}`),
  approve: (id: string) => axiosInstance.patch(`${LISTINGS}/${id}/approve`),
  reject: (id: string, reason: string) => axiosInstance.patch(`${LISTINGS}/${id}/reject`, { reason }),
  toggleFeatured: (id: string) => axiosInstance.patch(`${LISTINGS}/${id}/feature`),
};
