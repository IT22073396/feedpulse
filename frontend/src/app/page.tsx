'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';

const CATEGORIES = ['Bug', 'Feature Request', 'Improvement', 'Other'];
const MAX_DESCRIPTION = 2000;
const MIN_DESCRIPTION = 20;

interface FormState {
  title: string;
  description: string;
  category: string;
  submitterName: string;
  submitterEmail: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  category?: string;
  submitterEmail?: string;
}

export default function Home() {
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: '',
    submitterName: '',
    submitterEmail: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 120) e.title = 'Max 120 characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < MIN_DESCRIPTION)
      e.description = `Minimum ${MIN_DESCRIPTION} characters`;
    if (!form.category) e.category = 'Select a category';
    if (form.submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail))
      e.submitterEmail = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    setApiError('');
    try {
      await submitFeedback({
        title: form.title,
        description: form.description,
        category: form.category,
        submitterName: form.submitterName || undefined,
        submitterEmail: form.submitterEmail || undefined,
      });
      setStatus('success');
      setForm({ title: '', description: '', category: '', submitterName: '', submitterEmail: '' });
      setErrors({});
    } catch (err: unknown) {
      setStatus('error');
      setApiError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    }
  };

  const charsLeft = MAX_DESCRIPTION - form.description.length;
  const descLength = form.description.trim().length;

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="card p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h2>
          <p className="text-gray-500 mb-6">
            Your feedback has been submitted and is being analysed by AI.
          </p>
          <button className="btn-primary w-full" onClick={() => setStatus('idle')}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">FP</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">FeedPulse</span>
          </div>
          <a href="/login" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
            Admin →
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Feedback</h1>
          <p className="text-gray-500">Help us build better products. Your feedback is analysed by AI instantly.</p>
        </div>

        {/* Error banner */}
        {status === 'error' && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {apiError || 'Something went wrong. Please try again.'}
          </div>
        )}

        <div className="card p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Title */}
            <div>
              <label className="label" htmlFor="title">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                className={`input w-full ${errors.title ? 'border-red-400' : ''}`}
                placeholder="Brief summary of your feedback"
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="label" htmlFor="category">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                className={`input w-full ${errors.category ? 'border-red-400' : ''}`}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <span className={`text-xs ${charsLeft < 100 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {descLength < MIN_DESCRIPTION
                    ? `${MIN_DESCRIPTION - descLength} more chars needed`
                    : `${charsLeft} left`}
                </span>
              </div>
              <textarea
                id="description"
                rows={5}
                className={`input w-full resize-none ${errors.description ? 'border-red-400' : ''}`}
                placeholder="Describe your feedback in detail (minimum 20 characters)..."
                maxLength={MAX_DESCRIPTION}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="name">Name (optional)</label>
                <input
                  id="name"
                  type="text"
                  className="input w-full"
                  placeholder="Your name"
                  value={form.submitterName}
                  onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="email">Email (optional)</label>
                <input
                  id="email"
                  type="email"
                  className={`input w-full ${errors.submitterEmail ? 'border-red-400' : ''}`}
                  placeholder="you@example.com"
                  value={form.submitterEmail}
                  onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                />
                {errors.submitterEmail && (
                  <p className="mt-1 text-xs text-red-500">{errors.submitterEmail}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full py-3 text-base"
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by AI · Your feedback helps shape the product
        </p>
      </main>
    </div>
  );
}
