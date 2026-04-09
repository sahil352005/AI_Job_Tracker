import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi, aiApi } from '../api';
import type { Application, AppStatus, ParsedJD } from '../types';

const STATUSES: AppStatus[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

interface Props {
  initial?: Application;
  onClose: () => void;
}

const empty = {
  company: '', role: '', jdLink: '', notes: '', salaryRange: '',
  status: 'Applied' as AppStatus, skills: [] as string[],
  niceToHaveSkills: [] as string[], seniority: '', location: '',
  resumeSuggestions: [] as string[],
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', fontSize: '14px', fontWeight: 500,
  border: '1.5px solid #e2e8f0', borderRadius: '10px', outline: 'none',
  background: '#f8fafc', color: '#1e293b', transition: 'all 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 700,
  color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px',
};

export default function ApplicationForm({ initial, onClose }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState(initial ? {
    company: initial.company, role: initial.role, jdLink: initial.jdLink ?? '',
    notes: initial.notes ?? '', salaryRange: initial.salaryRange ?? '',
    status: initial.status, skills: initial.skills ?? [],
    niceToHaveSkills: initial.niceToHaveSkills ?? [], seniority: initial.seniority ?? '',
    location: initial.location ?? '', resumeSuggestions: initial.resumeSuggestions ?? [],
  } : empty);
  const [jd, setJd] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Application>) =>
      initial ? applicationsApi.update(initial._id, data) : applicationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); onClose(); },
  });

  const handleParse = async () => {
    if (!jd.trim()) return;
    setParsing(true); setParseError('');
    try {
      const parsed: ParsedJD = await aiApi.parse(jd);
      setForm((f) => ({ ...f, company: parsed.company || f.company, role: parsed.role || f.role, skills: parsed.skills, niceToHaveSkills: parsed.niceToHaveSkills, seniority: parsed.seniority, location: parsed.location, resumeSuggestions: parsed.resumeSuggestions }));
    } catch { setParseError('AI parsing failed. Fill in the fields manually.'); }
    finally { setParsing(false); }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#7c3aed';
    e.target.style.background = '#fff';
    e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.background = '#f8fafc';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{initial ? 'Edit Application' : 'New Application'}</h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{initial ? 'Update the details below' : 'Paste a JD to auto-fill with AI'}</p>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* AI Parser */}
            {!initial && (
              <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f0f4ff)', border: '1.5px solid #ddd6fe', borderRadius: '14px', padding: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#6d28d9', marginBottom: '12px' }}>✨ AI Job Description Parser</p>
                <textarea
                  rows={3}
                  placeholder="Paste the full job description here..."
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  style={{ ...inputStyle, resize: 'none', border: '1.5px solid #ddd6fe' }}
                  onFocus={focusInput} onBlur={blurInput}
                />
                {parseError && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '8px', fontWeight: 500 }}>⚠ {parseError}</p>}
                <button
                  onClick={handleParse}
                  disabled={parsing || !jd.trim()}
                  style={{ marginTop: '12px', padding: '10px 20px', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', borderRadius: '10px', border: 'none', opacity: (parsing || !jd.trim()) ? 0.5 : 1, cursor: (parsing || !jd.trim()) ? 'not-allowed' : 'pointer' }}
                >
                  {parsing ? '⏳ Parsing...' : '✨ Parse with AI'}
                </button>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Company *</label>
                <input style={inputStyle} placeholder="e.g. Google" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>Role *</label>
                <input style={inputStyle} placeholder="e.g. Software Engineer" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} onFocus={focusInput} onBlur={blurInput} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Location</label>
                <input style={inputStyle} placeholder="e.g. New York" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>Seniority</label>
                <input style={inputStyle} placeholder="e.g. Mid-level" value={form.seniority} onChange={(e) => setForm((f) => ({ ...f, seniority: e.target.value }))} onFocus={focusInput} onBlur={blurInput} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Salary Range</label>
                <input style={inputStyle} placeholder="e.g. $120k–$150k" value={form.salaryRange} onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>Job URL</label>
                <input style={inputStyle} placeholder="https://..." value={form.jdLink} onChange={(e) => setForm((f) => ({ ...f, jdLink: e.target.value }))} onFocus={focusInput} onBlur={blurInput} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AppStatus }))} onFocus={focusInput} onBlur={blurInput}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {form.skills.length > 0 && (
              <div>
                <label style={labelStyle}>Required Skills</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.skills.map((s) => (
                    <span key={s} style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '99px', border: '1px solid #ede9fe' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {form.niceToHaveSkills.length > 0 && (
              <div>
                <label style={labelStyle}>Nice to Have</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {form.niceToHaveSkills.map((s) => (
                    <span key={s} style={{ background: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '99px', border: '1px solid #e2e8f0' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Notes</label>
              <textarea rows={3} placeholder="Any notes about this application..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: 'none' }} onFocus={focusInput} onBlur={blurInput} />
            </div>

            {form.resumeSuggestions.length > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f0f4ff)', border: '1.5px solid #ddd6fe', borderRadius: '14px', padding: '20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#6d28d9', marginBottom: '14px' }}>✨ AI Resume Suggestions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {form.resumeSuggestions.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #ede9fe' }}>
                      <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}.</span>
                      <p style={{ fontSize: '13px', color: '#334155', flex: 1, lineHeight: 1.6 }}>{s}</p>
                      <button
                        onClick={() => copy(s, i)}
                        style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', border: 'none', background: copied === i ? '#d1fae5' : '#ede9fe', color: copied === i ? '#065f46' : '#7c3aed', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                      >{copied === i ? '✓ Done' : 'Copy'}</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mutation.isError && (
              <p style={{ color: '#dc2626', fontSize: '13px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', fontWeight: 500 }}>Failed to save. Please try again.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fafafa', borderRadius: '0 0 20px 20px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700, color: '#475569', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.company || !form.role}
            style={{ flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', border: 'none', borderRadius: '10px', cursor: mutation.isPending || !form.company || !form.role ? 'not-allowed' : 'pointer', opacity: mutation.isPending || !form.company || !form.role ? 0.6 : 1, transition: 'all 0.2s' }}
          >
            {mutation.isPending ? 'Saving...' : initial ? 'Save Changes' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
