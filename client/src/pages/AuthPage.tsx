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
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Left panel */}
      <div style={{ flex: 1, background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 60%, #9333ea 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid rgba(255,255,255,0.3)' }}>🎯</div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>JobTrack AI</span>
          </div>

          <h1 style={{ fontSize: '38px', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: '16px' }}>
            Track every<br />opportunity.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, maxWidth: '340px', marginBottom: '48px' }}>
            AI-powered job application tracker. Paste a job description and let AI fill in the details and generate tailored resume bullets.
          </p>

          {/* Feature list */}
          {[
            { icon: '✨', text: 'AI parses job descriptions instantly' },
            { icon: '📋', text: 'Kanban board with drag & drop' },
            { icon: '📝', text: 'Tailored resume bullet suggestions' },
            { icon: '🔒', text: 'Your data, private and secure' },
          ].map((f) => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: '480px', flexShrink: 0, background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', marginBottom: '6px' }}>
            {isLogin ? 'Welcome back 👋' : 'Create account'}
          </h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500 }}>
            {isLogin ? 'Sign in to your account to continue' : 'Start tracking your job applications'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#f8fafc', borderRadius: '10px', padding: '4px', marginBottom: '28px', border: '1px solid #f1f5f9' }}>
          {(['Sign In', 'Register'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setIsLogin(tab === 'Sign In'); setError(''); }}
              style={{
                flex: 1, padding: '9px', fontSize: '13px', fontWeight: 700, borderRadius: '7px', border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: (isLogin ? 'Sign In' : 'Register') === tab ? '#fff' : 'transparent',
                color: (isLogin ? 'Sign In' : 'Register') === tab ? '#7c3aed' : '#94a3b8',
                boxShadow: (isLogin ? 'Sign In' : 'Register') === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >{tab}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Email Address</label>
            <input
              type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '13px 16px', fontSize: '14px', fontWeight: 500, border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', background: '#f8fafc', color: '#0f172a', transition: 'all 0.15s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>Password</label>
            <input
              type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '13px 16px', fontSize: '14px', fontWeight: 500, border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none', background: '#f8fafc', color: '#0f172a', transition: 'all 0.15s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626', fontSize: '13px', fontWeight: 600 }}>
              ⚠ {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', borderRadius: '10px', border: 'none', boxShadow: '0 4px 14px rgba(109,40,217,0.35)', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s', marginTop: '4px' }}
            onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(109,40,217,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(109,40,217,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1', marginTop: '32px', fontWeight: 500 }}>
          Powered by OpenAI · Groq · Gemini
        </p>
      </div>
    </div>
  );
}
