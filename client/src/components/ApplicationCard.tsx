import { useState } from 'react';
import type { Application, AppStatus } from '../types';

interface Props {
  app: Application;
  onClick: () => void;
}

const STATUS_COLOR: Record<AppStatus, string> = {
  Applied: '#3b82f6',
  'Phone Screen': '#f59e0b',
  Interview: '#f97316',
  Offer: '#10b981',
  Rejected: '#ef4444',
};

export default function ApplicationCard({ app, onClick }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '14px',
        padding: '20px',
        cursor: 'pointer',
        border: hovered ? '1.5px solid #c4b5fd' : '1.5px solid #f1f5f9',
        boxShadow: hovered ? '0 8px 24px rgba(124,58,237,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '6px' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, color: hovered ? '#7c3aed' : '#1e293b', lineHeight: 1.3, transition: 'color 0.2s' }}>
          {app.company}
        </p>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLOR[app.status], flexShrink: 0, marginTop: '4px' }} />
      </div>

      {/* Role */}
      <p style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginBottom: '14px' }}>{app.role}</p>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
        {app.location && (
          <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📍 {app.location}{app.seniority ? ` · ${app.seniority}` : ''}
          </span>
        )}
        {app.salaryRange && (
          <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            💰 {app.salaryRange}
          </span>
        )}
      </div>

      {/* Skills */}
      {app.skills && app.skills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
          {app.skills.slice(0, 3).map((s) => (
            <span key={s} style={{
              background: '#f5f3ff', color: '#7c3aed', fontSize: '12px', fontWeight: 600,
              padding: '4px 10px', borderRadius: '99px', border: '1px solid #ede9fe',
            }}>{s}</span>
          ))}
          {app.skills.length > 3 && (
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, padding: '4px 6px' }}>+{app.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #f8fafc', paddingTop: '12px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
          Applied {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}
