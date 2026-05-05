'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push('/admin/stays');
      router.refresh();
    } else {
      setError('Invalid password');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FAF7F2] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E8E0D5] p-8 shadow-sm">
        <div className="text-center mb-8">
          <p className="text-xs text-[#C4714A] font-semibold uppercase tracking-widest mb-3">
            Locali Admin
          </p>
          <h1 className="text-3xl text-[#2C2420] font-light" style={{ fontFamily: 'Georgia, serif' }}>
            Sign in to manage stays
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block mb-1.5 text-sm font-medium text-[#2C2420]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter admin password"
            className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg text-[#2C2420] focus:border-[#C4714A] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/20 mb-4 transition-all"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C2420] text-white rounded-lg font-medium hover:bg-[#C4714A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
