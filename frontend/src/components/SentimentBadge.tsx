import type { FeedbackSentiment } from '@/types';

const config: Record<
  FeedbackSentiment,
  { label: string; classes: string; dot: string }
> = {
  Positive: {
    label: 'Positive',
    classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
  },
  Neutral: {
    label: 'Neutral',
    classes: 'bg-gray-100 text-gray-600 ring-gray-500/20',
    dot: 'bg-gray-400',
  },
  Negative: {
    label: 'Negative',
    classes: 'bg-red-50 text-red-700 ring-red-600/20',
    dot: 'bg-red-500',
  },
};

export default function SentimentBadge({
  sentiment,
}: {
  sentiment?: FeedbackSentiment;
}) {
  if (!sentiment)
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1
        text-xs text-gray-400 ring-1 ring-inset ring-gray-400/20"
      >
        Analysing...
      </span>
    );

  const { label, classes, dot } = config[sentiment];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1
      text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}