'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFeedback, fetchStats, fetchSummary } from '@/lib/api';
import FeedbackCard from '@/components/FeedbackCard';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';
import type { Feedback, Stats, Pagination as PaginationType, GeminiTheme, FeedbackFilters } from '@/types';

export default function DashboardPage() {
  const router = useRouter();

  const [items, setItems] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<PaginationType | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<GeminiTheme[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [filters, setFilters] = useState<FeedbackFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Guard — redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem('feedpulse_token')) {
      router.replace('/login');
    }
  }, [router]);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFeedback(filters);
      setItems(result.items);
      setPagination(result.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    setStatsLoading(true);
    fetchStats()
      .then(setStats)
      .finally(() => setStatsLoading(false));
  }, []);

  const handleUpdate = (updated: Feedback) =>
    setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));

  const handleDelete = (id: string) =>
    setItems((prev) => prev.filter((i) => i._id !== id));

  const handleLogout = () => {
    localStorage.removeItem('feedpulse_token');
    router.push('/login');
  };

  const handleToggleSummary = async () => {
    if (!showSummary && summary.length === 0) {
      setSummaryLoading(true);
      try {
        const themes = await fetchSummary();
        setSummary(themes);
      } finally {
        setSummaryLoading(false);
      }
    }
    setShowSummary((v) => !v);
  };

  const handleFiltersChange = (newFilters: FeedbackFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky topbar */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">FeedPulse</span>
            <span className="hidden sm:inline text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="btn-secondary text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Submit Feedback
            </a>
            <button
              onClick={handleToggleSummary}
              className="btn-secondary text-sm hidden sm:flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.346.346a3 3 0 01-2.122.879H9.25a3 3 0 01-2.122-.879l-.346-.346z" />
              </svg>
              AI Summary
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats bar */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* AI Summary Panel */}
        {showSummary && (
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.346.346a3 3 0 01-2.122.879H9.25a3 3 0 01-2.122-.879l-.346-.346z" />
              </svg>
              <h2 className="font-semibold text-gray-800">Weekly AI Themes</h2>
              <span className="text-xs text-gray-400">Last 7 days</span>
            </div>
            {summaryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-1" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : summary.length === 0 ? (
              <p className="text-sm text-gray-400">No processed feedback in the last 7 days.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {summary.map((theme, i) => (
                  <div key={i} className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        #{i + 1}
                      </span>
                      <span className="font-medium text-gray-800 text-sm">{theme.theme}</span>
                    </div>
                    <p className="text-xs text-gray-500">{theme.description}</p>
                    <p className="text-xs text-purple-600 mt-1 font-medium">{theme.count} mentions</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FilterBar */}
        <FilterBar filters={filters} onChange={handleFiltersChange} />

        {/* Feedback list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500">
              {pagination ? `${pagination.total} total · page ${pagination.page} of ${pagination.totalPages}` : ''}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-400 text-sm">No feedback found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <FeedbackCard
                  key={item._id}
                  feedback={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={(p: number) => setFilters((f) => ({ ...f, page: p }))}
          />
        )}
      </main>
    </div>
  );
}
