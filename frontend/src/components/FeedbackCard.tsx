'use client';

import { useState } from 'react';
import {
  updateStatus,
  reanalyseFeedback,
  deleteFeedbackItem,
} from '@/lib/api';
import SentimentBadge from './SentimentBadge';
import CategoryBadge from './CategoryBadge';
import StatusBadge from './StatusBadge';

const STATUSES = ['New', 'In Review', 'Resolved'];

export default function FeedbackCard({
  feedback,
  onUpdate,
  onDelete,
}: any) {
  const [expanded, setExpanded] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  const handleStatusChange = async (status: string) => {
    setLoadingStatus(true);
    const updated = await updateStatus(feedback._id, status);
    onUpdate(updated);
    setLoadingStatus(false);
  };

  const handleReanalyse = async () => {
    setLoadingAI(true);
    const updated = await reanalyseFeedback(feedback._id);
    onUpdate(updated);
    setLoadingAI(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this item?')) return;
    await deleteFeedbackItem(feedback._id);
    onDelete(feedback._id);
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow">
      {/* Priority number pill + CategoryBadge + SentimentBadge + StatusBadge */}
      {/* Title + ai_summary preview + date/submitter */}
      {/* Status dropdown | Re-analyse button | Delete button | Expand chevron */}
      {/* Expanded: full description + ai_tags + submitterEmail */}
    </div>
  );
}