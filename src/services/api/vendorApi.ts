import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { VENDORS } = API_CONFIG.ENDPOINTS.ADMIN;
export const vendorApi = {
  getAll: (params?: Record<string, unknown>) => axiosInstance.get(VENDORS, { params }),
  approve: (id: string) => axiosInstance.patch(`${VENDORS}/${id}/approve`),
  reject: (id: string, reason: string) => axiosInstance.patch(`${VENDORS}/${id}/reject`, { reason }),
  suspend: (id: string) => axiosInstance.patch(`${VENDORS}/${id}/suspend`),
};
