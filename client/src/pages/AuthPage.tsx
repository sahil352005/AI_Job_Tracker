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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            marginBottom: '16px', fontSize: '28px',
          }}>🎯</div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>JobTrack AI</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginTop: '6px' }}>Smart job tracking for ambitious engineers</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
            {(['Sign In', 'Register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Sign In'); setError(''); }}
                style={{
                  flex: 1, padding: '18px 16px', fontSize: '15px', fontWeight: 600,
                  color: (isLogin ? 'Sign In' : 'Register') === tab ? '#7c3aed' : '#94a3b8',
                  borderBottom: (isLogin ? 'Sign In' : 'Register') === tab ? '2px solid #7c3aed' : '2px solid transparent',
                  transition: 'all 0.2s', background: 'none',
                }}
              >{tab}</button>
            ))}
          </div>

          {/* Form */}
          <div style={{ padding: '40px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '14px 16px', fontSize: '15px', fontWeight: 500,
                    border: '1.5px solid #e2e8f0', borderRadius: '12px', outline: 'none',
                    background: '#f8fafc', color: '#1e293b', transition: 'all 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '14px 16px', fontSize: '15px', fontWeight: 500,
                    border: '1.5px solid #e2e8f0', borderRadius: '12px', outline: 'none',
                    background: '#f8fafc', color: '#1e293b', transition: 'all 0.2s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#7c3aed'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#dc2626', fontSize: '14px', fontWeight: 500 }}>
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700,
                  color: '#fff', borderRadius: '12px', border: 'none',
                  background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                  boxShadow: '0 4px 15px rgba(109,40,217,0.4)',
                  opacity: loading ? 0.7 : 1, transition: 'all 0.2s',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In →' : 'Create Account →'}
              </button>
            </form>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '20px' }}>
          Powered by OpenAI · Groq · Gemini
        </p>
      </div>
    </div>
  );
}
