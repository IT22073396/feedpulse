export type FeedbackSentiment = 'Positive' | 'Neutral' | 'Negative';
export type FeedbackCategory = 'Bug' | 'Feature Request' | 'Improvement' | 'Other';
export type FeedbackStatus = 'New' | 'In Review' | 'Resolved';

export interface Feedback {
  _id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  submitterName?: string;
  submitterEmail?: string;
  ai_category?: string;
  ai_sentiment?: FeedbackSentiment;
  ai_priority?: number;
  ai_summary?: string;
  ai_tags?: string[];
  ai_processed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeedbackListResponse {
  items: Feedback[];
  pagination: Pagination;
}

export interface Stats {
  total: number;
  open: number;
  avgPriority: number | null;
  topTag: string | null;
}

export interface GeminiTheme {
  theme: string;
  count: number;
  description: string;
}

export interface FeedbackFilters {
  category?: string;
  status?: string;
  sentiment?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}
