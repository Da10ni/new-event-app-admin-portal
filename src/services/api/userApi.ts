import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { USERS } = API_CONFIG.ENDPOINTS.ADMIN;
export const userApi = {
  getAll: (params?: Record<string, unknown>) => axiosInstance.get(USERS, { params }),
  toggleStatus: (id: string) => axiosInstance.patch(`${USERS}/${id}/status`),
};
