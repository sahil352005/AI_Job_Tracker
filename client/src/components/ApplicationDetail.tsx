import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api';
import type { Application, AppStatus } from '../types';
import ApplicationForm from './ApplicationForm';

interface Props {
  app: Application;
  onClose: () => void;
}

const STATUS_STYLE: Record<AppStatus, { bg: string; color: string }> = {
  Applied:        { bg: '#dbeafe', color: '#1d4ed8' },
  'Phone Screen': { bg: '#fef3c7', color: '#b45309' },
  Interview:      { bg: '#ffedd5', color: '#c2410c' },
  Offer:          { bg: '#dcfce7', color: '#15803d' },
  Rejected:       { bg: '#fee2e2', color: '#b91c1c' },
};

export default function ApplicationDetail({ app, onClose }: Props) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => applicationsApi.delete(app._id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); onClose(); },
  });

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  if (editing) return <ApplicationForm initial={app} onClose={() => { setEditing(false); onClose(); }} />;

  const st = STATUS_STYLE[app.status];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '540px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{app.company}</h2>
              <p style={{ fontSize: '15px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>{app.role}</p>
            </div>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >✕</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, padding: '5px 14px', borderRadius: '99px', background: st.bg, color: st.color }}>{app.status}</span>
            {app.seniority && <span style={{ fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '99px', background: '#f1f5f9', color: '#475569' }}>{app.seniority}</span>}
            {app.location && <span style={{ fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '99px', background: '#f1f5f9', color: '#475569' }}>📍 {app.location}</span>}
            {app.salaryRange && <span style={{ fontSize: '13px', fontWeight: 600, padding: '5px 14px', borderRadius: '99px', background: '#f0fdf4', color: '#15803d' }}>💰 {app.salaryRange}</span>}
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Date Applied</p>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#334155' }}>
                {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {app.jdLink && (
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Job Posting</p>
                <a href={app.jdLink} target="_blank" rel="noreferrer" style={{ fontSize: '15px', fontWeight: 700, color: '#7c3aed' }}>View ↗</a>
              </div>
            )}
          </div>

          {app.notes && (
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #f1f5f9' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Notes</p>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>{app.notes}</p>
            </div>
          )}

          {app.skills && app.skills.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Required Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {app.skills.map((s) => (
                  <span key={s} style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '99px', border: '1px solid #ede9fe' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {app.niceToHaveSkills && app.niceToHaveSkills.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Nice to Have</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {app.niceToHaveSkills.map((s) => (
                  <span key={s} style={{ background: '#f8fafc', color: '#64748b', fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '99px', border: '1px solid #e2e8f0' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {app.resumeSuggestions && app.resumeSuggestions.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f0f4ff)', border: '1.5px solid #ddd6fe', borderRadius: '14px', padding: '20px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#6d28d9', marginBottom: '14px' }}>✨ AI Resume Suggestions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {app.resumeSuggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#fff', borderRadius: '10px', padding: '14px', border: '1px solid #ede9fe' }}>
                    <span style={{ color: '#c4b5fd', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    <p style={{ fontSize: '13px', color: '#334155', flex: 1, lineHeight: 1.6 }}>{s}</p>
                    <button
                      onClick={() => copy(s, i)}
                      style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '8px', border: 'none', background: copied === i ? '#d1fae5' : '#ede9fe', color: copied === i ? '#065f46' : '#7c3aed', cursor: 'pointer', flexShrink: 0 }}
                    >{copied === i ? '✓ Done' : 'Copy'}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #f1f5f9', flexShrink: 0, background: '#fafafa', borderRadius: '0 0 20px 20px' }}>
          <button
            onClick={() => setEditing(true)}
            style={{ flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700, color: '#475569', background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' }}
          >✏️ Edit</button>
          <button
            onClick={() => { if (confirm('Delete this application?')) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
            style={{ flex: 1, padding: '13px', fontSize: '14px', fontWeight: 700, color: '#dc2626', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: '10px', cursor: 'pointer', opacity: deleteMutation.isPending ? 0.6 : 1 }}
          >{deleteMutation.isPending ? 'Deleting...' : '🗑️ Delete'}</button>
        </div>
      </div>
    </div>
  );
}
