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
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 h-[58px] flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)' }}>
            🎯
          </div>
          <span className="font-bold text-slate-800 text-[15px] tracking-tight">JobTrack</span>
          <span className="font-bold text-[15px] tracking-tight" style={{ color: '#7c3aed' }}>AI</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 mr-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg, #6d28d9, #a78bfa)' }}>
              {initial}
            </div>
            <span className="text-sm text-slate-500 max-w-[160px] truncate">{email}</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', boxShadow: '0 2px 8px rgba(109,40,217,0.35)' }}
          >
            <span className="text-base leading-none">+</span> Add Application
          </button>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-red-500 transition font-semibold px-2 py-1 rounded-lg hover:bg-red-50">
            Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      {applications.length > 0 && (
        <div className="bg-white border-b border-slate-200 px-6 h-10 flex items-center gap-4 overflow-x-auto shrink-0">
          <span className="text-xs font-semibold text-slate-400 shrink-0">
            {applications.length} total
          </span>
          <div className="w-px h-4 bg-slate-100 shrink-0" />
          {COLUMNS.map((col) => (
            <div key={col} className="flex items-center gap-1.5 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${COL[col].dot}`} />
              <span className="text-xs text-slate-500 font-medium">{col}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${COL[col].count}`}>
                {byStatus(col).length}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Board */}
      <main className="flex-1 p-6 overflow-x-auto">
        <div className="mx-auto max-w-[1600px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <svg className="animate-spin h-7 w-7 text-violet-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-slate-400 text-sm font-medium">Loading your board...</p>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-64">
              <p className="text-red-500 text-sm font-medium">Failed to load. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && applications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-violet-50">📋</div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold">No applications yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "Add Application" to get started</p>
              </div>
            </div>
          )}

          {!isLoading && !isError && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="inline-flex gap-5 min-w-max pb-6">
                {COLUMNS.map((col) => {
                  const cards = byStatus(col);
                  const s = COL[col];
                  return (
                    <div key={col} className="min-w-[22rem] max-w-[22rem] flex-shrink-0 flex flex-col gap-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                          <span className="text-sm font-semibold text-slate-700">{col}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.count}`}>
                          {cards.length}
                        </span>
                      </div>

                      <Droppable droppableId={col}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`rounded-[32px] border border-slate-200 p-4 flex flex-col gap-4 min-h-[240px] transition-all ${s.bg} ${snapshot.isDraggingOver ? `ring-2 ${s.glow}` : ''}`}
                          >
                            {cards.length === 0 && !snapshot.isDraggingOver && (
                              <div className="flex flex-col items-center justify-center py-8 gap-1.5">
                                <span className="text-slate-300 text-2xl">⊕</span>
                                <p className="text-xs text-slate-400 font-medium">Drop here</p>
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
                                      opacity: snapshot.isDragging ? 0.9 : 1,
                                      rotate: snapshot.isDragging ? '1.5deg' : '0deg',
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
