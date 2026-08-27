import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Mail, AlertCircle } from 'lucide-react';

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your studio email address.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email.trim().toLowerCase());
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col justify-center items-center font-sans p-6">
      <div className="w-full max-w-[360px] space-y-6">
        {/* Logo and Intro */}
        <div className="text-center space-y-3">
          <img
            src="/logo.svg"
            alt="Orangyy Carpels"
            className="w-12 h-12 object-contain mx-auto transition-transform hover:scale-105"
          />
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Sign in to Orangyy Carpels</h2>
            <p className="text-[12px] text-studio-muted">Studio operations, timesheets & resource billing</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-studio-border rounded-lg p-6 space-y-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">
                Studio Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-studio-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@orangy.design"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-studio-border rounded bg-studio-bg/10 text-[13px] focus:outline-none focus:border-brand-orange focus:bg-white text-studio-text"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 border border-red-200 bg-red-50 text-red-700 rounded text-[11px] font-medium flex items-start gap-1.5 leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-orange text-white rounded py-2 text-[12px] font-semibold hover:bg-opacity-95 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
            >
              {loading ? 'Authenticating...' : 'Continue'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
