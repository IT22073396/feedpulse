import type { FeedbackStatus } from '@/types';

const config: Record<FeedbackStatus, { label: string; classes: string; dot: string }> = {
  New: {
    label: 'New',
    classes: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    dot: 'bg-sky-500',
  },
  'In Review': {
    label: 'In Review',
    classes: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    dot: 'bg-purple-500',
  },
  Resolved: {
    label: 'Resolved',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
};

export default function StatusBadge({ status }: { status: FeedbackStatus }) {
  const { label, classes, dot } = config[status] ?? config.New;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
