'use client';

import type { Stats } from '@/types';

function StatCard({ label, value, sub, color }: any) {
  return (
    <div className="card p-5 flex flex-col gap-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function StatsBar({ stats, loading }: any) {
  if (loading)
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-3 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-7 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Feedback"
        value={stats?.total ?? 0}
        color="text-gray-900"
      />

      <StatCard
        label="Open Items"
        value={stats?.open ?? 0}
        color="text-sky-600"
        sub="New + In Review"
      />

      <StatCard
        label="Avg Priority"
        value={
          stats?.avgPriority != null
            ? `${stats.avgPriority} / 10`
            : '—'
        }
        color="text-amber-600"
      />

      <StatCard
        label="Top Tag"
        value={stats?.topTag ?? '—'}
        color="text-purple-600"
        sub="Most common AI tag"
      />
    </div>
  );
}