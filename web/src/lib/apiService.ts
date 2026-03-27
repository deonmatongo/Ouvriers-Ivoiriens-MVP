import api from './api';
import type {
  AuthResponse, Job, JobFilters, Quote, ArtisanProfile,
  Message, Review, Conversation, RequestStatus,
} from '../types';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (payload: { name: string; email: string; password: string; role: 'client' | 'artisan'; phone?: string }) =>
    api.post<AuthResponse>('/auth/register', payload).then((r) => r.data),

  sendOTP: (phone: string) =>
    api.post<{ message: string }>('/auth/send-otp', { phone }).then((r) => r.data),

  verifyOTP: (phone: string, code: string) =>
    api.post<{ message: string }>('/auth/verify-otp', { phone, code }).then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }).then((r) => r.data),
};

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const jobsApi = {
  list: (filters?: JobFilters) =>
    api.get<Job[]>('/jobs', { params: filters }).then((r) => r.data),

  create: (payload: {
    title: string;
    description: string;
    category: string;
    location_address?: string;
    budget?: number;
    latitude?: number;
    longitude?: number;
  }) => api.post<Job>('/jobs', payload).then((r) => r.data),

  getById: (id: string) =>
    api.get<Job>(`/jobs/${id}`).then((r) => r.data),

  updateStatus: (id: string, status: RequestStatus) =>
    api.patch<Job>(`/jobs/${id}/status`, { status }).then((r) => r.data),
};

// ─── Quotes ──────────────────────────────────────────────────────────────────

export const quotesApi = {
  create: (jobId: string, payload: { price: number; message?: string }) =>
    api.post<Quote>(`/jobs/${jobId}/quotes`, payload).then((r) => r.data),

  accept: (quoteId: string) =>
    api.patch<Quote>(`/quotes/${quoteId}/accept`).then((r) => r.data),

  reject: (quoteId: string) =>
    api.patch<Quote>(`/quotes/${quoteId}/reject`).then((r) => r.data),
};

// ─── Artisan profile ─────────────────────────────────────────────────────────

export const artisanApi = {
  getMyProfile: () =>
    api.get<ArtisanProfile>('/artisans/profile/me').then((r) => r.data),

  getProfile: (id: string) =>
    api.get<ArtisanProfile>(`/artisans/profile/${id}`).then((r) => r.data),

  upsertProfile: (payload: Partial<ArtisanProfile>) =>
    api.post<ArtisanProfile>('/artisans/profile', payload).then((r) => r.data),

  updateAvailability: (is_available: boolean) =>
    api.patch<ArtisanProfile>('/artisans/profile/me/availability', { is_available }).then((r) => r.data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string }>('/upload/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },

  uploadPortfolio: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post<{ urls: string[] }>('/upload/portfolio', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
};

// ─── Messages ────────────────────────────────────────────────────────────────

export const messagesApi = {
  getConversations: () =>
    api.get<Conversation[]>('/messages').then((r) => r.data),

  getThread: (requestId: string) =>
    api.get<Message[]>(`/messages/${requestId}`).then((r) => r.data),

  send: (payload: { receiver_id: string; request_id: string; content: string }) =>
    api.post<Message>('/messages', payload).then((r) => r.data),

  markRead: (requestId: string) =>
    api.patch<void>(`/messages/${requestId}/read`).then((r) => r.data),
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviewsApi = {
  getForArtisan: (artisanId?: string) =>
    api.get<Review[]>(artisanId ? `/reviews?artisan_id=${artisanId}` : '/reviews/me').then((r) => r.data),

  create: (payload: { request_id: string; artisan_id: string; rating: number; comment?: string }) =>
    api.post<Review>('/reviews', payload).then((r) => r.data),
};
