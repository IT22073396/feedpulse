'use client';

import { useState } from 'react';
import { updateStatus, reanalyseFeedback, deleteFeedbackItem } from '@/lib/api';
import SentimentBadge from './SentimentBadge';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';
import type { Feedback } from '@/types';

const STATUSES = ['New', 'In Review', 'Resolved'];

interface Props {
  feedback: Feedback;
  onUpdate: (updated: Feedback) => void;
  onDelete: (id: string) => void;
}

export default function FeedbackCard({ feedback, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleStatusChange = async (status: string) => {
    setLoadingStatus(true);
    try {
      const updated = await updateStatus(feedback._id, status);
      onUpdate(updated);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleReanalyse = async () => {
    setLoadingAI(true);
    setAiError('');
    try {
      const updated = await reanalyseFeedback(feedback._id);
      onUpdate(updated);
    } catch {
      setAiError('AI analysis failed. Try again later.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this feedback item?')) return;
    await deleteFeedbackItem(feedback._id);
    onDelete(feedback._id);
  };

  const date = new Date(feedback.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Priority pill */}
          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
            ${feedback.ai_priority
              ? feedback.ai_priority >= 8
                ? 'bg-red-100 text-red-700'
                : feedback.ai_priority >= 5
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-400'
            }`}>
            {feedback.ai_priority ?? '—'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <CategoryBadge category={feedback.category} />
              <SentimentBadge sentiment={feedback.ai_sentiment} />
              <StatusBadge status={feedback.status} />
            </div>

            <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 truncate">
              {feedback.title}
            </h3>

            {feedback.ai_summary && (
              <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                {feedback.ai_summary}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{date}</span>
              {feedback.submitterName && (
                <>
                  <span>·</span>
                  <span>{feedback.submitterName}</span>
                </>
              )}
            </div>
          </div>

          {/* Expand chevron */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {/* Status dropdown */}
          <select
            value={feedback.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loadingStatus}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Re-analyse button */}
          <button
            onClick={handleReanalyse}
            disabled={loadingAI}
            className="text-xs px-2 py-1 rounded-md border border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            {loadingAI ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Re-analyse
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-500 bg-red-50 hover:bg-red-100 transition-colors ml-auto"
          >
            Delete
          </button>
        </div>
        {aiError && (
          <p className="text-xs text-red-500 mt-2">{aiError}</p>
        )}
      </div>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Full Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.description}</p>
          </div>

          {feedback.ai_tags && feedback.ai_tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">AI Tags</p>
              <div className="flex flex-wrap gap-1">
                {feedback.ai_tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {feedback.submitterEmail && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Contact</p>
              <p className="text-sm text-gray-700">{feedback.submitterEmail}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
