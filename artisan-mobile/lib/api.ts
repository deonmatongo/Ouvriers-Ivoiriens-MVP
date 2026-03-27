import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }
    return Promise.reject(error);
  },
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: object) => api.post('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  sendOTP: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
};

export const jobsApi = {
  list: (params?: object) => api.get('/jobs', { params }),
  create: (data: object) => api.post('/jobs', data),
  createQuote: (jobId: string, data: object) => api.post(`/jobs/${jobId}/quotes`, data),
  acceptQuote: (quoteId: string) => api.patch(`/quotes/${quoteId}/accept`),
};

export const artisanApi = {
  getMyProfile: () => api.get('/artisans/profile/me'),
  upsertProfile: (data: object) => api.post('/artisans/profile', data),
  search: (params?: object) => api.get('/artisans/search', { params }),
};

export const messagesApi = {
  getConversations: () => api.get('/messages/conversations'),
  getThread: (requestId: string) => api.get(`/messages/${requestId}`),
  send: (data: object) => api.post('/messages', data),
};
