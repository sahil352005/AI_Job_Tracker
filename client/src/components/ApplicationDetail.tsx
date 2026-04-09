import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationsApi } from '../api';
import type { Application, AppStatus } from '../types';
import ApplicationForm from './ApplicationForm';

interface Props {
  app: Application;
  onClose: () => void;
}

const STATUS_STYLE: Record<AppStatus, string> = {
  Applied: 'bg-blue-100 text-blue-700',
  'Phone Screen': 'bg-amber-100 text-amber-700',
  Interview: 'bg-orange-100 text-orange-700',
  Offer: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-600',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[95vh] flex flex-col border border-slate-100" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 shrink-0 bg-slate-50/30">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-slate-900 truncate">{app.company}</h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">{app.role}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition shrink-0 text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs font-bold px-3.5 py-2 rounded-lg ${STATUS_STYLE[app.status]}`}>{app.status}</span>
            {app.seniority && <span className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700">💼 {app.seniority}</span>}
            {app.location && <span className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-100 text-slate-700">📍 {app.location}</span>}
            {app.salaryRange && <span className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-emerald-50 text-emerald-700">💰 {app.salaryRange}</span>}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 flex flex-col gap-5">

          {/* Info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">📅 Date Applied</p>
              <p className="text-base font-bold text-slate-800">
                {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            {app.jdLink ? (
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">🔗 Job Posting</p>
                <a href={app.jdLink} target="_blank" rel="noreferrer" className="text-base font-bold text-violet-600 hover:text-violet-800 hover:underline transition-colors inline-flex items-center gap-1">
                  View Posting <span>↗</span>
                </a>
              </div>
            ) : <div />}
          </div>

          {app.notes && (
            <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-3">📝 Notes</p>
              <p className="text-sm text-slate-700 leading-relaxed">{app.notes}</p>
            </div>
          )}

          {app.skills && app.skills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">⚡ Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {app.skills.map((s) => (
                  <span key={s} className="bg-violet-100 text-violet-800 text-xs px-3 py-1.5 rounded-full border border-violet-200 font-semibold">{s}</span>
                ))}
              </div>
            </div>
          )}

          {app.niceToHaveSkills && app.niceToHaveSkills.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">🎯 Nice to Have</p>
              <div className="flex flex-wrap gap-2">
                {app.niceToHaveSkills.map((s) => (
                  <span key={s} className="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-semibold">{s}</span>
                ))}
              </div>
            </div>
          )}

          {app.resumeSuggestions && app.resumeSuggestions.length > 0 && (
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 shadow-sm">
              <p className="text-sm font-bold text-violet-900 mb-4 flex items-center gap-2">
                <span>✨</span> AI Resume Optimization
              </p>
              <div className="flex flex-col gap-2.5">
                {app.resumeSuggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3.5 border border-violet-100">
                    <span className="text-violet-400 text-xs font-bold shrink-0 mt-0.5 w-5">{i + 1}.</span>
                    <p className="text-xs text-slate-700 flex-1 leading-relaxed">{s}</p>
                    <button
                      onClick={() => copy(s, i)}
                      className={`text-xs font-bold shrink-0 px-3 py-1.5 rounded-lg transition-all ${copied === i ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                    >
                      {copied === i ? '✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-7 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-2xl">
          <button
            onClick={() => setEditing(true)}
            className="flex-1 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-sm font-bold hover:bg-slate-100 transition-all"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => { if (confirm('Delete this application? This action cannot be undone.')) deleteMutation.mutate(); }}
            disabled={deleteMutation.isPending}
            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg py-2.5 text-sm font-bold transition-all disabled:opacity-50 border border-red-100"
          >
            {deleteMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Deleting...
              </span>
            ) : '🗑️ Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
