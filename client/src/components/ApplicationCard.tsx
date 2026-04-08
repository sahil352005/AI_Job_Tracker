import type { Application, AppStatus } from '../types';

interface Props {
  app: Application;
  onClick: () => void;
}

const STATUS_DOT: Record<AppStatus, string> = {
  Applied: 'bg-blue-500',
  'Phone Screen': 'bg-amber-500',
  Interview: 'bg-orange-500',
  Offer: 'bg-emerald-500',
  Rejected: 'bg-red-500',
};

export default function ApplicationCard({ app, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 cursor-pointer border border-slate-100 group transition-all duration-150 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 hover:-translate-y-px"
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <p className="font-semibold text-slate-800 text-sm leading-snug truncate group-hover:text-violet-700 transition-colors min-w-0">
          {app.company}
        </p>
        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[app.status]}`} />
      </div>

      <p className="text-slate-500 text-xs mt-0.5 font-medium truncate">{app.role}</p>

      <div className="flex flex-wrap gap-2 mt-2 text-slate-400 text-xs">
        {app.location && (
          <span className="flex items-center gap-1 min-w-0">
            <span>📍</span>
            <span className="truncate">{app.location}</span>
          </span>
        )}
        {app.seniority && (
          <span className="text-slate-300">·</span>
        )}
        {app.seniority && (
          <span className="min-w-0 truncate">{app.seniority}</span>
        )}
      </div>
      {app.salaryRange && (
        <p className="text-emerald-600 text-xs font-semibold mt-2">💰 {app.salaryRange}</p>
      )}

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
        <span className="text-slate-400 text-xs">
          {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        {app.skills && app.skills.length > 0 && (
          <div className="flex items-center gap-1">
            {app.skills.slice(0, 2).map((s) => (
              <span key={s} className="bg-violet-50 text-violet-600 text-xs px-2 py-0.5 rounded-full font-medium">{s}</span>
            ))}
            {app.skills.length > 2 && (
              <span className="text-slate-400 text-xs font-medium">+{app.skills.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
