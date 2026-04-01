'use client';

import { useState } from 'react';
import { submitFeedback } from '@/lib/api';

const CATEGORIES = ['Bug', 'Feature Request', 'Improvement', 'Other'];
const MAX_DESCRIPTION = 2000;
const MIN_DESCRIPTION = 20;

export default function Home() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    submitterName: '',
    submitterEmail: '',
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e: any = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 120) e.title = 'Max 120 characters';

    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length < MIN_DESCRIPTION)
      e.description = 'Minimum 20 characters';

    if (!form.category) e.category = 'Select a category';

    if (form.submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.submitterEmail))
      e.submitterEmail = 'Invalid email';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    try {
      await submitFeedback({ ...form });
      setStatus('success');
      setForm({
        title: '',
        description: '',
        category: '',
        submitterName: '',
        submitterEmail: '',
      });
    } catch (err: any) {
      setStatus('error');
      setApiError(err.message || 'Something went wrong. Please try again.');
    }
  };

  // Character counter shown below textarea
  const charsLeft = MAX_DESCRIPTION - form.description.length;
  const descLength = form.description.trim().length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Header, success/error states, form — see full file in the zip */}
      {/* Form validates on submit, shows live char counter, posts to API */}
    </div>
  );
}