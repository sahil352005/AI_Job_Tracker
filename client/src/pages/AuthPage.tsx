import { useState, type FormEvent } from 'react';
import { useAuth } from '../store/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10 bg-white" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10 bg-white" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-4 border border-white/20">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">JobTrack AI</h1>
          <p className="text-white/60 text-sm mt-1.5 font-medium">Track smarter. Land faster.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-slate-100">
            {(['Sign In', 'Register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Sign In'); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                  (isLogin ? 'Sign In' : 'Register') === tab
                    ? 'text-violet-600 border-b-2 border-violet-600 bg-violet-50/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-300 font-medium"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  <span className="text-red-400 text-sm">⚠</span>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60 mt-1"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 4px 14px rgba(109,40,217,0.4)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Please wait...
                  </span>
                ) : isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/40 text-xs mt-5">
          Powered by OpenAI · Groq · Gemini
        </p>
      </div>
    </div>
  );
}
