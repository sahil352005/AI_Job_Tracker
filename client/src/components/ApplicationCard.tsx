import { useState } from 'react';
import type { Application, AppStatus } from '../types';

interface Props {
  app: Application;
  onClick: () => void;
}

const STATUS_CONFIG: Record<AppStatus, { color: string; bg: string; label: string }> = {
  Applied:        { color: '#2563eb', bg: '#eff6ff', label: 'Applied' },
  'Phone Screen': { color: '#d97706', bg: '#fffbeb', label: 'Phone Screen' },
  Interview:      { color: '#ea580c', bg: '#fff7ed', label: 'Interview' },
  Offer:          { color: '#16a34a', bg: '#f0fdf4', label: 'Offer' },
  Rejected:       { color: '#dc2626', bg: '#fef2f2', label: 'Rejected' },
};

export default function ApplicationCard({ app, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const st = STATUS_CONFIG[app.status];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        border: `1.5px solid ${hovered ? '#a78bfa' : '#e8edf2'}`,
        boxShadow: hovered ? '0 8px 24px rgba(109,40,217,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.18s ease',
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Top color bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${st.color}, ${st.color}88)` }} />

      <div style={{ padding: '16px' }}>
        {/* Company + status badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          <p style={{ fontSize: '15px', fontWeight: 700, color: hovered ? '#7c3aed' : '#0f172a', lineHeight: 1.3, transition: 'color 0.18s', flex: 1 }}>
            {app.company}
          </p>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: st.bg, color: st.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {st.label}
          </span>
        </div>

        {/* Role */}
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '12px', lineHeight: 1.4 }}>{app.role}</p>

        {/* Meta row */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '12px' }}>
          {app.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px' }}>📍</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{app.location}{app.seniority ? ` · ${app.seniority}` : ''}</span>
            </div>
          )}
          {app.salaryRange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '12px' }}>💰</span>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>{app.salaryRange}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {app.skills && app.skills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
            {app.skills.slice(0, 3).map((s) => (
              <span key={s} style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ede9fe' }}>{s}</span>
            ))}
            {app.skills.length > 3 && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', padding: '3px 4px' }}>+{app.skills.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>
            {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>View details →</span>
        </div>
      </div>
    </div>
  );
}
