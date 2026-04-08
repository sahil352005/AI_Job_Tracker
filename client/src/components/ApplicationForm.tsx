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

const INPUT = 'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-slate-50 focus:bg-white placeholder:text-slate-300 font-medium text-slate-800';
const LABEL = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">{initial ? 'Edit Application' : 'New Application'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{initial ? 'Update the details below' : 'Paste a JD to auto-fill with AI'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition text-base font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">

          {/* AI Parser */}
          {!initial && (
            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">✨</span>
                <p className="text-sm font-bold text-violet-800">AI Job Description Parser</p>
              </div>
              <textarea
                rows={3}
                placeholder="Paste the full job description here and click Parse..."
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                className="w-full border border-violet-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none placeholder:text-slate-300 font-medium"
              />
              {parseError && (
                <p className="text-red-500 text-xs mt-2 font-medium">⚠ {parseError}</p>
              )}
              <button
                type="button"
                onClick={handleParse}
                disabled={parsing || !jd.trim()}
                className="mt-3 flex items-center gap-2 text-sm font-bold text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
              >
                {parsing ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Parsing...
                  </>
                ) : '✨ Parse with AI'}
              </button>
            </div>
          )}

          {/* Form fields */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Company *</label>
                <input className={INPUT} placeholder="e.g. Google" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Role *</label>
                <input className={INPUT} placeholder="e.g. Software Engineer" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Location</label>
                <input className={INPUT} placeholder="e.g. New York" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Seniority</label>
                <input className={INPUT} placeholder="e.g. Mid-level" value={form.seniority} onChange={(e) => setForm((f) => ({ ...f, seniority: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Salary Range</label>
                <input className={INPUT} placeholder="e.g. $120k–$150k" value={form.salaryRange} onChange={(e) => setForm((f) => ({ ...f, salaryRange: e.target.value }))} />
              </div>
              <div>
                <label className={LABEL}>Job URL</label>
                <input className={INPUT} placeholder="https://..." value={form.jdLink} onChange={(e) => setForm((f) => ({ ...f, jdLink: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className={LABEL}>Status</label>
              <select className={INPUT} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AppStatus }))}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {form.skills.length > 0 && (
              <div>
                <label className={LABEL}>Required Skills</label>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills.map((s) => (
                    <span key={s} className="bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full border border-violet-100 font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {form.niceToHaveSkills.length > 0 && (
              <div>
                <label className={LABEL}>Nice to Have</label>
                <div className="flex flex-wrap gap-1.5">
                  {form.niceToHaveSkills.map((s) => (
                    <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className={LABEL}>Notes</label>
              <textarea
                rows={2}
                placeholder="Any notes about this application..."
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className={`${INPUT} resize-none`}
              />
            </div>

            {form.resumeSuggestions.length > 0 && (
              <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
                <p className="text-xs font-bold text-violet-800 mb-3 flex items-center gap-1.5">
                  <span>✨</span> AI Resume Suggestions
                </p>
                <div className="flex flex-col gap-2">
                  {form.resumeSuggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white rounded-lg p-3 border border-violet-100">
                      <span className="text-violet-300 text-xs font-bold shrink-0 mt-0.5 w-4">{i + 1}.</span>
                      <p className="text-xs text-slate-700 flex-1 leading-relaxed">{s}</p>
                      <button
                        type="button"
                        onClick={() => copy(s, i)}
                        className={`text-xs font-bold shrink-0 px-2.5 py-1 rounded-lg transition ${copied === i ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
                      >
                        {copied === i ? '✓ Done' : 'Copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mutation.isError && (
              <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                Failed to save. Please try again.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 text-sm font-bold hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={mutation.isPending || !form.company || !form.role}
            className="flex-1 text-white rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-50 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
          >
            {mutation.isPending ? 'Saving...' : initial ? 'Save Changes' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
