import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { applicationsApi } from '../api';
import type { Application, AppStatus } from '../types';
import { useAuth } from '../store/AuthContext';
import ApplicationCard from '../components/ApplicationCard';
import ApplicationForm from '../components/ApplicationForm';
import ApplicationDetail from '../components/ApplicationDetail';

const COLUMNS: AppStatus[] = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected'];

const COL: Record<AppStatus, { dot: string; bg: string; border: string; count: string; glow: string }> = {
  Applied:        { dot: 'bg-blue-500',    bg: 'bg-blue-50/70',    border: 'border-blue-100',    count: 'bg-blue-100 text-blue-700',     glow: 'ring-blue-200' },
  'Phone Screen': { dot: 'bg-amber-500',   bg: 'bg-amber-50/70',   border: 'border-amber-100',   count: 'bg-amber-100 text-amber-700',   glow: 'ring-amber-200' },
  Interview:      { dot: 'bg-orange-500',  bg: 'bg-orange-50/70',  border: 'border-orange-100',  count: 'bg-orange-100 text-orange-700', glow: 'ring-orange-200' },
  Offer:          { dot: 'bg-emerald-500', bg: 'bg-emerald-50/70', border: 'border-emerald-100', count: 'bg-emerald-100 text-emerald-700',glow: 'ring-emerald-200' },
  Rejected:       { dot: 'bg-red-400',     bg: 'bg-red-50/70',     border: 'border-red-100',     count: 'bg-red-100 text-red-600',       glow: 'ring-red-200' },
};

export default function KanbanPage() {
  const { email, logout } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);

  const { data: applications = [], isLoading, isError } = useQuery({
    queryKey: ['applications'],
    queryFn: applicationsApi.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppStatus }) =>
      applicationsApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as AppStatus;
    const app = applications.find((a) => a._id === result.draggableId);
    if (!app || app.status === newStatus) return;
    updateMutation.mutate({ id: result.draggableId, status: newStatus });
  };

  const byStatus = (s: AppStatus) => applications.filter((a) => a.status === s);
  const initial = email?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/50 px-6 h-16 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}>
            🎯
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-800 text-base tracking-tight">JobTrack</span>
              <span className="font-bold text-base tracking-tight" style={{ color: '#7c3aed' }}>AI</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Track your job applications</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50/50 border border-slate-100">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6d28d9, #a78bfa)' }}>
              {initial}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-slate-700">{email?.split('@')[0]}</span>
              <span className="text-xs text-slate-500">{email?.split('@')[1]}</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 4px 12px rgba(109,40,217,0.3)' }}
          >
            <span className="text-base leading-none">✨</span> New App
          </button>
          <button onClick={logout} className="text-xs text-slate-500 hover:text-red-600 transition font-semibold px-3 py-2 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100">
            Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      {applications.length > 0 && (
        <div className="bg-white/50 backdrop-blur-sm border-b border-slate-200/50 px-6 h-14 flex items-center gap-6 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100/60">
            <span className="text-sm font-black text-slate-700">{applications.length}</span>
            <span className="text-xs font-semibold text-slate-600">Applications</span>
          </div>
          <div className="w-px h-5 bg-slate-200/50 shrink-0" />
          {COLUMNS.map((col) => (
            <div key={col} className="flex items-center gap-2 shrink-0">
              <span className={`w-2 h-2 rounded-full ${COL[col].dot}`} />
              <span className="text-xs text-slate-600 font-medium">{col}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${COL[col].count}`}>
                {byStatus(col).length}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Board */}
      <main className="flex-1 p-6 overflow-x-auto bg-gradient-to-b from-slate-50/50 to-slate-100/30">
        <div className="mx-auto max-w-[1600px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="relative w-12 h-12">
                <svg className="animate-spin w-full h-full text-violet-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
              <p className="text-slate-600 text-sm font-semibold">Loading your applications...</p>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-96">
              <div className="bg-white rounded-xl border border-red-200 p-6 max-w-sm">
                <p className="text-red-700 text-center font-semibold">Unable to load applications</p>
                <button onClick={() => window.location.reload()} className="mt-4 w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-all">
                  Retry
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && applications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96 gap-5">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200">📋</div>
              <div className="text-center">
                <p className="text-slate-800 font-bold text-lg">No applications yet</p>
                <p className="text-slate-500 text-sm mt-1">Start tracking your job journey</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}
                >
                  Create First Application
                </button>
              </div>
            </div>
          )}

          {!isLoading && !isError && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="inline-flex gap-6 min-w-max pb-6">
                {COLUMNS.map((col) => {
                  const cards = byStatus(col);
                  const s = COL[col];
                  return (
                    <div key={col} className="min-w-[340px] max-w-[340px] flex-shrink-0 flex flex-col gap-4">
                      {/* Column header */}
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${s.dot}`} />
                          <span className="text-sm font-bold text-slate-800">{col}</span>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${s.count}`}>
                          {cards.length}
                        </span>
                      </div>

                      {/* Droppable area */}
                      <Droppable droppableId={col}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`rounded-2xl border-2 p-4 flex flex-col gap-3 min-h-[300px] transition-all duration-200 ${s.bg} ${snapshot.isDraggingOver ? `border-violet-400 ring-4 ${s.glow}` : 'border-slate-200'}`}
                          >
                            {cards.length === 0 && !snapshot.isDraggingOver && (
                              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-300">
                                <svg className="w-8 h-8 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs font-medium">Drag cards here</p>
                              </div>
                            )}
                            {cards.map((app, index) => (
                              <Draggable key={app._id} draggableId={app._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.85 : 1,
                                    }}
                                  >
                                    <ApplicationCard app={app} onClick={() => setSelected(app)} />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  );
                })}
              </div>
            </DragDropContext>
          )}
        </div>
      </main>

      {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
      {selected && <ApplicationDetail app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
