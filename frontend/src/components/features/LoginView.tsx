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
    if (!email) {
      setError('Please enter your studio email address.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Authentication failed.');
    }
  };

  const seedUsers = [
    { label: 'Super Admin (Arun)', email: 'arun@orangy.design' },
    { label: 'Project Manager (Navaneetha)', email: 'navaneetha@orangy.design' },
    { label: 'Employee (Alex)', email: 'alex.carter@orangy.studio' },
    { label: 'Employee (Emma)', email: 'emma.watson@orangy.studio' },
  ];

  return (
    <div className="min-h-screen bg-studio-bg flex flex-col justify-center items-center font-sans p-6">
      <div className="w-full max-w-[360px] space-y-6">
        {/* Logo and Intro */}
        <div className="text-center space-y-3">
          <img
            src="/logo.png"
            alt="Orangy Carpels"
            className="w-12 h-12 object-contain mx-auto transition-transform hover:scale-105"
          />
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-studio-text">Sign in to Orangy Carpels</h2>
            <p className="text-[12px] text-studio-muted">Studio operations, timesheets & resource billing</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-studio-border rounded-lg p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[11px] font-bold text-studio-muted uppercase tracking-wider">
                Studio Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-studio-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@orangy.studio"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-studio-border rounded bg-studio-bg/10 text-[13px] focus:outline-none focus:border-brand-blue focus:bg-white text-studio-text"
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
              className="w-full bg-brand-orange text-white rounded py-2 text-[12px] font-semibold hover:bg-opacity-95 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Continue'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Seed Credentials Hints */}
        <div className="bg-studio-sidebar border border-studio-border rounded-lg p-4 space-y-2">
          <h4 className="text-[10px] font-bold text-studio-muted uppercase tracking-wider">
            Evaluation Seed Emails
          </h4>
          <p className="text-[11px] text-studio-muted leading-relaxed">
            Click to copy one of the seeded employee emails below to test the active RBAC matrix layers:
          </p>
          <div className="space-y-1.5 pt-1">
            {seedUsers.map((u) => (
              <button
                key={u.email}
                onClick={() => setEmail(u.email)}
                className="w-full flex justify-between items-center text-[11px] px-2 py-1 bg-white border border-studio-border rounded hover:border-brand-blue/40 text-studio-text text-left font-medium transition-colors"
              >
                <span>{u.label}</span>
                <span className="text-studio-muted text-[10px]">{u.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
