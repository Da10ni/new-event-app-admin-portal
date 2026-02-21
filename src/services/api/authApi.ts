import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../../config/api.config';
const { AUTH } = API_CONFIG.ENDPOINTS;
export const authApi = {
  login: (data: { email: string; password: string }) => axiosInstance.post(AUTH.LOGIN, data),
  logout: (refreshToken: string) => axiosInstance.post(AUTH.LOGOUT, { refreshToken }),
};
