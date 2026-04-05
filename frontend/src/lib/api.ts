import axios from 'axios';
import type { Feedback, FeedbackListResponse, Stats, GeminiTheme } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('feedpulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('feedpulse_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function submitFeedback(payload: {
  title: string;
  description: string;
  category: string;
  submitterName?: string;
  submitterEmail?: string;
}): Promise<Feedback> {
  const { data } = await api.post('/feedback', payload);
  return data.data;
}

export async function fetchFeedback(filters = {}): Promise<FeedbackListResponse> {
  const { data } = await api.get('/feedback', { params: filters });
  return data.data;
}

export async function updateStatus(id: string, status: string): Promise<Feedback> {
  const { data } = await api.patch(`/feedback/${id}`, { status });
  return data.data;
}

export async function reanalyseFeedback(id: string): Promise<Feedback> {
  const { data } = await api.post(`/feedback/${id}/reanalyse`);
  return data.data;
}

export async function deleteFeedbackItem(id: string): Promise<void> {
  await api.delete(`/feedback/${id}`);
}

export async function loginAdmin(email: string, password: string): Promise<string> {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data.token;
}

export async function fetchStats(): Promise<Stats> {
  const { data } = await api.get('/feedback/stats');
  return data.data;
}

export async function fetchSummary(): Promise<GeminiTheme[]> {
  const { data } = await api.get('/feedback/summary');
  return data.data?.themes ?? [];
}
