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
      className="bg-white rounded-xl p-4 cursor-pointer border border-slate-100 group transition-all duration-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-200/50 hover:-translate-y-1 active:scale-95"
    >
      {/* Header with company and status */}
      <div className="flex items-start justify-between gap-2 min-w-0 mb-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-sm leading-tight truncate group-hover:text-violet-700 transition-colors">
            {app.company}
          </p>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${STATUS_DOT[app.status]}`} />
      </div>

      {/* Role */}
      <p className="text-slate-600 text-xs font-medium truncate mb-2.5">{app.role}</p>

      {/* Meta info */}
      <div className="flex flex-col gap-1 text-slate-500 text-xs mb-3">
        {app.location && (
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-xs">📍</span>
            <span className="truncate">{app.location}</span>
          </span>
        )}
        {app.seniority && (
          <span className="flex items-center gap-1.5">
            <span className="text-xs">💼</span>
            <span>{app.seniority}</span>
          </span>
        )}
        {app.salaryRange && (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="text-xs">💰</span>
            <span>{app.salaryRange}</span>
          </span>
        )}
      </div>

      {/* Skills */}
      {app.skills && app.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {app.skills.slice(0, 2).map((s) => (
            <span key={s} className="bg-violet-50 text-violet-700 text-xs px-2.5 py-1 rounded-full font-medium border border-violet-100">{s}</span>
          ))}
          {app.skills.length > 2 && (
            <span className="text-slate-500 text-xs font-medium px-1 py-1">+{app.skills.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer with date */}
      <div className="pt-2.5 border-t border-slate-100/80">
        <span className="text-slate-400 text-xs">
          Applied {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: new Date(app.dateApplied).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}
        </span>
      </div>
    </div>
  );
}
