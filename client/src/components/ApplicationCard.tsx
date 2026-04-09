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
      className="bg-white rounded-lg p-5 cursor-pointer border border-slate-100 group transition-all duration-200 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-200/50 hover:-translate-y-1 active:scale-95"
    >
      {/* Header with company and status */}
      <div className="flex items-start justify-between gap-2 min-w-0 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800 text-base leading-tight truncate group-hover:text-violet-700 transition-colors">
            {app.company}
          </p>
        </div>
        <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${STATUS_DOT[app.status]}`} />
      </div>

      {/* Role */}
      <p className="text-slate-600 text-sm font-medium truncate mb-3">{app.role}</p>

      {/* Meta info */}
      <div className="flex flex-col gap-2 text-slate-500 text-sm mb-4">
        {app.location && (
          <span className="flex items-center gap-2 truncate">
            <span className="text-base">📍</span>
            <span className="truncate">{app.location}</span>
          </span>
        )}
        {app.seniority && (
          <span className="flex items-center gap-2">
            <span className="text-base">💼</span>
            <span>{app.seniority}</span>
          </span>
        )}
        {app.salaryRange && (
          <span className="flex items-center gap-2 text-emerald-600 font-medium">
            <span className="text-base">💰</span>
            <span>{app.salaryRange}</span>
          </span>
        )}
      </div>

      {/* Skills */}
      {app.skills && app.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {app.skills.slice(0, 2).map((s) => (
            <span key={s} className="bg-violet-50 text-violet-700 text-xs px-3 py-1.5 rounded-full font-medium border border-violet-100">{s}</span>
          ))}
          {app.skills.length > 2 && (
            <span className="text-slate-500 text-xs font-medium px-2 py-1.5">+{app.skills.length - 2}</span>
          )}
        </div>
      )}

      {/* Footer with date */}
      <div className="pt-3 border-t border-slate-100/80">
        <span className="text-slate-400 text-xs">
          Applied {new Date(app.dateApplied).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: new Date(app.dateApplied).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined })}
        </span>
      </div>
    </div>
  );
}
