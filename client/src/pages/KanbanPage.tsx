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

const COL_STYLE: Record<AppStatus, { dot: string; bg: string; border: string; badgeBg: string; badgeColor: string }> = {
  Applied:        { dot: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', badgeBg: '#dbeafe', badgeColor: '#1d4ed8' },
  'Phone Screen': { dot: '#f59e0b', bg: '#fffbeb', border: '#fde68a', badgeBg: '#fef3c7', badgeColor: '#b45309' },
  Interview:      { dot: '#f97316', bg: '#fff7ed', border: '#fed7aa', badgeBg: '#ffedd5', badgeColor: '#c2410c' },
  Offer:          { dot: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', badgeBg: '#dcfce7', badgeColor: '#15803d' },
  Rejected:       { dot: '#ef4444', bg: '#fef2f2', border: '#fecaca', badgeBg: '#fee2e2', badgeColor: '#b91c1c' },
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>

      {/* Header */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
          }}>🎯</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>JobTrack</span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed' }}>AI</span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Track your job applications</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6d28d9, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700, color: '#fff',
            }}>{initial}</div>
            <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>{email}</span>
          </div>

          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', fontSize: '14px', fontWeight: 700, color: '#fff',
              background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
              borderRadius: '10px', border: 'none',
              boxShadow: '0 4px 12px rgba(109,40,217,0.35)',
              transition: 'all 0.2s',
            }}
          >
            + Add Application
          </button>

          <button
            onClick={logout}
            style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 600, padding: '8px 12px', borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Stats bar */}
      {applications.length > 0 && (
        <div style={{
          background: '#fff', borderBottom: '1px solid #e2e8f0',
          padding: '0 32px', height: '48px',
          display: 'flex', alignItems: 'center', gap: '24px',
          overflowX: 'auto', flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
            {applications.length} Total
          </span>
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0', flexShrink: 0 }} />
          {COLUMNS.map((col) => (
            <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: COL_STYLE[col].dot, flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{col}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: COL_STYLE[col].badgeBg, color: COL_STYLE[col].badgeColor }}>
                {byStatus(col).length}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Board */}
      <main style={{ flex: 1, padding: '28px 32px', overflowX: 'auto' }}>
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 500 }}>Loading your board...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {isError && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <p style={{ color: '#ef4444', fontSize: '15px', fontWeight: 500 }}>Failed to load. Please refresh.</p>
          </div>
        )}

        {!isLoading && !isError && applications.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '16px' }}>
            <div style={{ fontSize: '48px' }}>📋</div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#334155' }}>No applications yet</p>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Click "Add Application" to get started</p>
          </div>
        )}

        {!isLoading && !isError && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div style={{ display: 'flex', gap: '20px', minWidth: 'max-content' }}>
              {COLUMNS.map((col) => {
                const cards = byStatus(col);
                const s = COL_STYLE[col];
                return (
                  <div key={col} style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.dot }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{col}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: s.badgeBg, color: s.badgeColor }}>
                        {cards.length}
                      </span>
                    </div>

                    <Droppable droppableId={col}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          style={{
                            background: snapshot.isDraggingOver ? '#ede9fe' : s.bg,
                            border: `2px solid ${snapshot.isDraggingOver ? '#a78bfa' : s.border}`,
                            borderRadius: '16px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            minHeight: '200px',
                            transition: 'all 0.2s',
                          }}
                        >
                          {cards.length === 0 && !snapshot.isDraggingOver && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px', color: '#cbd5e1', fontSize: '13px', fontWeight: 500 }}>
                              Drop cards here
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
      </main>

      {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
      {selected && <ApplicationDetail app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
