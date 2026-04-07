export type Role = 'client' | 'artisan' | 'admin';

export type RequestStatus = 'requested' | 'quoted' | 'accepted' | 'in_progress' | 'completed';

export type QuoteStatus = 'pending' | 'accepted' | 'rejected';

export type PaymentMethod = 'orange_money' | 'mtn' | 'wave' | 'card';

export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phone_verified: boolean;
  role: Role;
  avatar_url?: string;
  created_at: string;
}

export interface ArtisanProfile {
  id: string;
  user_id: string;
  category?: string;
  skills: string[];
  bio?: string;
  hourly_rate?: number;
  experience_years?: number;
  is_verified: boolean;
  is_available: boolean;
  rating_avg: number;
  total_jobs: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
  user?: User;
}

export interface Job {
  id: string;
  client_id: string;
  artisan_id?: string;
  title: string;
  description: string;
  category: string;
  status: RequestStatus;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  budget?: number;
  created_at: string;
  client?: User;
  artisan?: User;
  quotes?: Quote[];
}

export interface Quote {
  id: string;
  request_id: string;
  artisan_id: string;
  price: number;
  message?: string;
  status: QuoteStatus;
  created_at: string;
  artisan?: ArtisanProfile;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  request_id: string;
  content: string;
  is_read: boolean;
  sent_at: string;
  sender?: User;
  receiver?: User;
}

export interface Review {
  id: string;
  client_id: string;
  artisan_id: string;
  request_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  client?: User;
  request?: Job;
}

export type ConvStatus = 'active' | 'pending_acceptance';

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
  request_id: string;
  conv_status: ConvStatus;
}

// API response shapes
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface JobFilters {
  status?: RequestStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}
