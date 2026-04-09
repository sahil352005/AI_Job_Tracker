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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 75%, #4facfe 100%)' }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #4facfe 100%)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand with enhanced styling */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl backdrop-blur-xl bg-white/10 mb-4 border border-white/30 shadow-lg">
            <span className="text-4xl">🎯</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>JobTrack AI</h1>
          <p className="text-white/80 text-base mt-2 font-medium">Smart job tracking for ambitious engineers</p>
        </div>

        {/* Enhanced card with backdrop blur */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Tab switcher with animation */}
          <div className="flex border-b border-slate-100/50 bg-slate-50/50">
            {(['Sign In', 'Register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Sign In'); setError(''); }}
                className={`flex-1 py-5 px-4 text-sm font-semibold transition-all duration-300 relative ${
                  (isLogin ? 'Sign In' : 'Register') === tab
                    ? 'text-violet-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
                {(isLogin ? 'Sign In' : 'Register') === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all bg-slate-50/50 focus:bg-white placeholder:text-slate-400 font-medium"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <span className="text-red-500 text-lg leading-none mt-0.5 shrink-0">⚠</span>
                  <p className="text-red-700 text-sm font-medium leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-lg text-sm font-bold text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-1 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 4px 15px rgba(109,40,217,0.35)' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Signing in...
                  </span>
                ) : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-white/70 text-xs mt-6 font-medium">
          Powered by <span className="font-semibold">OpenAI</span> • <span className="font-semibold">Groq</span> • <span className="font-semibold">Gemini</span>
        </p>
      </div>
    </div>
  );
}
