import type { FeedbackCategory } from '@/types';

const config: Record<FeedbackCategory, { label: string; classes: string }> = {
  Bug: {
    label: 'Bug',
    classes: 'bg-red-50 text-red-700 ring-red-600/20',
  },
  'Feature Request': {
    label: 'Feature Request',
    classes: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  Improvement: {
    label: 'Improvement',
    classes: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  Other: {
    label: 'Other',
    classes: 'bg-gray-100 text-gray-600 ring-gray-500/20',
  },
};

export default function CategoryBadge({ category }: { category: FeedbackCategory }) {
  const { label, classes } = config[category] ?? config.Other;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classes}`}>
      {label}
    </span>
  );
}
