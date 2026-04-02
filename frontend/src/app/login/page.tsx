'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('feedpulse_token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = await loginAdmin(email, password);
      localStorage.setItem('feedpulse_token', token);
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50
      flex items-center justify-center px-4"
    >
      <div className="w-full max-w-sm">
        {/* Logo, heading, form */}
        {/* Default credentials shown: admin@feedpulse.com / admin123 */}
      </div>
    </div>
  );
}