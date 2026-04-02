'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fetchFeedback, fetchStats, fetchSummary } from '@/lib/api';
import FeedbackCard from '@/components/FeedbackCard';
import StatsBar from '@/components/StatsBar';
import FilterBar from '@/components/FilterBar';
import Pagination from '@/components/Pagination';

export default function DashboardPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);

  const [filters, setFilters] = useState({
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
    const result = await fetchFeedback(filters);
    setItems(result.items);
    setPagination(result.pagination);
  }, [filters]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  const handleUpdate = (updated: any) =>
    setItems((prev) =>
      prev.map((i: any) => (i._id === updated._id ? updated : i))
    );

  const handleDelete = (id: string) =>
    setItems((prev) => prev.filter((i: any) => i._id !== id));

  const handleLogout = () => {
    localStorage.removeItem('feedpulse_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky topbar with logo + Weekly AI Summary button + Sign out */}
      {/* StatsBar — 4 stat cards */}
      {/* AI Summary panel (on-demand — Nice to Have) */}
      {/* FilterBar — search, category, status, sentiment, sort chips */}
      {/* FeedbackCard list with loading skeleton */}
      {/* Pagination */}
    </div>
  );
}