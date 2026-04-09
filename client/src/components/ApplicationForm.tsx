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

const INPUT = 'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-400 font-medium text-slate-800';
const LABEL = 'block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2';

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
    setParsing(true);
    setParseError('');
    try {
      const parsed: ParsedJD = await aiApi.parse(jd);
      setForm((f) => ({
        ...f,
        company: parsed.company || f.company,
        role: parsed.role || f.role,
        skills: parsed.skills,
        niceToHaveSkills: parsed.niceToHaveSkills,
        seniority: parsed.seniority,
        location: parsed.location,
        resumeSuggestions: parsed.resumeSuggestions,
      }));
    } catch {
      setParseError('AI parsing failed. Fill in the fields manually.');
    } finally {
      setParsing(false);
    }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: 'rgba(15,23,42,0.5)' }}>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-slate-100" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 shrink-0 bg-slate-50/30">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{initial ? '✏️ Edit Application' : '✨ New Application'}</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium">{initial ? 'Update the details below' : 'Add and track a new job application'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-all text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 flex flex-col gap-6">

          {/* AI Parser */}
          {!initial && (
            <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="text-lg">✨</span>
                <p className="text-sm font-bold text-violet-900">AI Job Description Parser</p>
              </div>
              <textarea
                rows={3}
                placeholder="Paste the full job description and auto-fill fields with AI..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="w-full border border-violet-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all bg-white resize-none placeholder:text-slate-400 font-medium"
              />
              {parseError && (
                <p className="text-red-600 text-xs mt-3 font-semibold flex items-center gap-1.5">
                  <span>⚠️</span> {parseError}
                </p>
              )}
              <button
                type="button"
                onClick={handleParse}
                disabled={parsing || !jd.trim()}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
              >
                {parsing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Analyzing...
                  </>
                ) : '✨ Parse with AI'}
              </button>
            </div>
          )}

          {/* Form fields */}
          <div className="flex flex-col gap-7">
            {/* Required fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Company *</label>
                <input className={INPUT} placeholder="e.g. Google" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Role *</label>
                <input className={INPUT} placeholder="e.g. Software Engineer" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
            </div>

            {/* Location & Seniority */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Location</label>
                <input className={INPUT} placeholder="e.g. New York, NY" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Seniority Level</label>
                <input className={INPUT} placeholder="e.g. Mid-level, Senior" value={form.seniority} onChange={(e) => setForm((f) => ({ ...f, seniority: e.target.value }))} />
              </div>
            </div>

            {/* Salary & URL */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Salary Range</label>
                <input className={INPUT} placeholder="e.g. $120k–$150k" value={form.salaryRange} onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Job Posting URL</label>
                <input className={INPUT} placeholder="https://..." value={form.jdLink} onChange={(e) => setForm((f) => ({ ...f, jdLink: e.target.value }))} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={LABEL}>Current Status</label>
              <select className={INPUT} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AppStatus }))}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {form.skills.length > 0 && (
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((s) => (
                    <span key={s} className="bg-violet-100 text-violet-800 text-xs px-3 py-1.5 rounded-full border border-violet-200 font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {form.niceToHaveSkills.length > 0 && (
              <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-3">Nice to Have</p>
                <div className="flex flex-wrap gap-2">
                  {form.niceToHaveSkills.map((s) => (
                    <span key={s} className="bg-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-full font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={LABEL}>Notes</label>
              <textarea
                rows={2}
                placeholder="Add any personal notes about this opportunity..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={`${INPUT} resize-none`}
              />
            </div>

            {form.resumeSuggestions.length > 0 && (
              <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4 shadow-sm">
                <p className="text-xs font-bold text-violet-900 uppercase tracking-widest mb-3.5 flex items-center gap-2">
                  <span>✨</span> AI Resume Optimization
                </p>
                <div className="flex flex-col gap-2.5">
                  {form.resumeSuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-violet-100">
                      <span className="text-violet-400 text-xs font-bold shrink-0 mt-0.5 w-4">{i + 1}.</span>
                      <p className="text-xs text-slate-700 flex-1 leading-relaxed">{s}</p>
                      <button
                        type="button"
                        onClick={() => copy(s, i)}
                        className={`text-xs font-bold shrink-0 px-2.5 py-1 rounded text-nowrap transition-all ${copied === i ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                      >
                        {copied === i ? '✓' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-red-700 text-xs font-semibold">Failed to save application. Please try again.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-7 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 rounded-lg py-2.5 text-sm font-bold hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.company || !form.role}
            className="flex-1 text-white rounded-lg py-2.5 text-sm font-bold transition-all disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving...
              </span>
            ) : initial ? 'Save Changes' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
