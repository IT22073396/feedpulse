'use client';

export default function Pagination({ page, totalPages, onChange }: any) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn-secondary p-2 disabled:opacity-40"
      >
        ¬
      </button>

      {[...Array(totalPages)].map((_, i) => {
        const p = i + 1;
        const isClose =
          p === 1 || p === totalPages || Math.abs(p - page) <= 1;

        if (!isClose)
          return p === 2 || p === totalPages - 1 ? (
            <span key={p} className="text-gray-400 text-sm px-1">
              …
            </span>
          ) : null;

        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium ${
              p === page
                ? 'bg-brand-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-secondary p-2 disabled:opacity-40"
      >
        ®
      </button>
    </div>
  );
}