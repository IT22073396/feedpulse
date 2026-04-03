'use client';

import { useState } from 'react';

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

export default function FilterBar({ filters, onChange }: any) {
  const [search, setSearch] = useState(filters.search ?? '');

  const handleSearch = (e: any) => {
    e.preventDefault();
    onChange({ ...filters, search: search || undefined, page: 1 });
  };

  const handleSelect = (key: string, value: string) =>
    onChange({ ...filters, [key]: value || undefined, page: 1 });

  const handleSort = (value: string) => {
    const [sortBy, sortOrder] = value.split('|');
    onChange({ ...filters, sortBy, sortOrder, page: 1 });
  };

  return (
    <div className="card p-4 space-y-3">
      {/* Search input with submit | Category select | Status select | Sentiment select */}
      {/* Sort chips row — one pill per option, active pill highlighted */}
    </div>
  );
}