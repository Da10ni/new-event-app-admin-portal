import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { API_CONFIG } from '../../config/api.config';
const axiosInstance = axios.create({ baseURL: API_CONFIG.BASE_URL, timeout: API_CONFIG.TIMEOUT, headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'admin' } });
const getToken = (): string | null => localStorage.getItem('admin_access_token');
const getRefreshToken = (): string | null => localStorage.getItem('admin_refresh_token');
export const setTokens = (access: string, refresh: string) => { localStorage.setItem('admin_access_token', access); localStorage.setItem('admin_refresh_token', refresh); };
export const clearTokens = () => { localStorage.removeItem('admin_access_token'); localStorage.removeItem('admin_refresh_token'); };
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => { const token = getToken(); if (token) config.headers.Authorization = `Bearer ${token}`; return config; }, (error) => Promise.reject(error));
axiosInstance.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  const isAuthRequest = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register');
  if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
    originalRequest._retry = true;
    try { const rt = getRefreshToken(); if (!rt) throw new Error(); const { data } = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, { refreshToken: rt }); setTokens(data.data.accessToken, data.data.refreshToken); originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`; return axiosInstance(originalRequest); }
    catch { clearTokens(); window.location.href = '/login'; return Promise.reject(error); }
  }
  return Promise.reject(error);
});
export default axiosInstance;
