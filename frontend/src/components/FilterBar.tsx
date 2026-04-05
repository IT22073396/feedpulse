'use client';

import { useState, useEffect } from 'react';
import type { FeedbackFilters } from '@/types';

const CATEGORIES = ['Bug', 'Feature Request', 'Improvement', 'Other'];
const STATUSES = ['New', 'In Review', 'Resolved'];
const SENTIMENTS = ['Positive', 'Neutral', 'Negative'];

const SORT_OPTIONS = [
  { value: 'createdAt|desc', label: 'Newest first' },
  { value: 'createdAt|asc', label: 'Oldest first' },
  { value: 'ai_priority|desc', label: 'Highest priority' },
  { value: 'ai_priority|asc', label: 'Lowest priority' },
  { value: 'ai_sentiment|asc', label: 'Sentiment' },
];

interface Props {
  filters: FeedbackFilters;
  onChange: (filters: FeedbackFilters) => void;
}

export default function FilterBar({ filters, onChange }: Props) {
  const [search, setSearch] = useState(filters.search ?? '');

  // Keep local search in sync when parent resets filters externally
  useEffect(() => {
    setSearch(filters.search ?? '');
  }, [filters.search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ ...filters, search: search || undefined, page: 1 });
  };

  const handleSelect = (key: keyof FeedbackFilters, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split('|');
    onChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  const activeSort = `${filters.sortBy ?? 'createdAt'}|${filters.sortOrder ?? 'desc'}`;

  const handleClearAll = () => {
    setSearch('');
    onChange({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const hasActiveFilters = filters.category || filters.status || filters.sentiment || filters.search;

  return (
    <div className="card p-4 space-y-3">
      {/* Top row: search + dropdowns */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-1 flex-1 min-w-48">
          <input
            type="text"
            className="input w-full text-sm flex-1"
            placeholder="Search by title or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-secondary px-3 py-1.5 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>

        {/* Category */}
        <select
          className="input text-sm w-auto"
          value={filters.category ?? ''}
          onChange={(e) => handleSelect('category', e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Status */}
        <select
          className="input text-sm w-auto"
          value={filters.status ?? ''}
          onChange={(e) => handleSelect('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Sentiment */}
        <select
          className="input text-sm w-auto"
          value={filters.sentiment ?? ''}
          onChange={(e) => handleSelect('sentiment', e.target.value)}
        >
          <option value="">All sentiments</option>
          {SENTIMENTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {hasActiveFilters && (
          <button onClick={handleClearAll} className="btn-secondary text-xs px-3 py-1.5 text-red-500 border-red-200">
            Clear
          </button>
        )}
      </div>

      {/* Sort chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-gray-400 self-center mr-1">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeSort === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
