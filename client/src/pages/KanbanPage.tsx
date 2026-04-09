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

const COL_STYLE: Record<AppStatus, { dot: string; bg: string; border: string; badgeBg: string; badgeColor: string; dragBg: string }> = {
  Applied:        { dot: '#2563eb', bg: '#f8faff', border: '#dbeafe', badgeBg: '#dbeafe', badgeColor: '#1d4ed8', dragBg: '#eff6ff' },
  'Phone Screen': { dot: '#d97706', bg: '#fffdf5', border: '#fde68a', badgeBg: '#fef3c7', badgeColor: '#b45309', dragBg: '#fffbeb' },
  Interview:      { dot: '#ea580c', bg: '#fffaf5', border: '#fed7aa', badgeBg: '#ffedd5', badgeColor: '#c2410c', dragBg: '#fff7ed' },
  Offer:          { dot: '#16a34a', bg: '#f7fdf9', border: '#bbf7d0', badgeBg: '#dcfce7', badgeColor: '#15803d', dragBg: '#f0fdf4' },
  Rejected:       { dot: '#dc2626', bg: '#fffafa', border: '#fecaca', badgeBg: '#fee2e2', badgeColor: '#b91c1c', dragBg: '#fef2f2' },
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
  const offerCount = byStatus('Offer').length;
  const interviewCount = byStatus('Interview').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top navbar */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0, position: 'sticky', top: 0, zIndex: 100 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎯</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>JobTrack</span>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.3px' }}>AI</span>
            </div>
          </div>
        </div>

        {/* Center nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {['Dashboard', 'Applications', 'Analytics'].map((item, i) => (
            <button key={item} style={{ padding: '7px 16px', fontSize: '13px', fontWeight: 600, color: i === 1 ? '#7c3aed' : '#64748b', background: i === 1 ? '#f5f3ff' : 'transparent', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
              {item}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', borderRadius: '9px', border: 'none', boxShadow: '0 3px 10px rgba(109,40,217,0.3)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 5px 16px rgba(109,40,217,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 3px 10px rgba(109,40,217,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> New Application
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px 6px 6px', background: '#f8fafc', borderRadius: '99px', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff' }}>{initial}</div>
            <span style={{ fontSize: '13px', color: '#334155', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
          </div>

          <button onClick={logout} style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, padding: '7px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
          >Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left sidebar */}
        <aside style={{ width: '240px', flexShrink: 0, background: '#fff', borderRight: '1px solid #e2e8f0', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px', overflowY: 'auto' }}>

          {/* Summary */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Overview</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{applications.length}</span>
              </div>
              {offerCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>🎉 Offers</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#15803d' }}>{offerCount}</span>
                </div>
              )}
              {interviewCount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fff7ed', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                  <span style={{ fontSize: '13px', color: '#c2410c', fontWeight: 600 }}>📅 Interviews</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#c2410c' }}>{interviewCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Pipeline */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Pipeline</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {COLUMNS.map((col) => {
                const count = byStatus(col).length;
                const pct = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
                const s = COL_STYLE[col];
                return (
                  <div key={col}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>{col}</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{count}</span>
                    </div>
                    <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: s.dot, borderRadius: '99px', transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: 'linear-gradient(135deg, #faf5ff, #f0f4ff)', borderRadius: '12px', padding: '16px', border: '1px solid #ddd6fe', marginTop: 'auto' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#6d28d9', marginBottom: '8px' }}>✨ Pro Tip</p>
            <p style={{ fontSize: '12px', color: '#7c3aed', lineHeight: 1.5 }}>Paste a job description to auto-fill all fields with AI and get tailored resume suggestions.</p>
          </div>
        </aside>

        {/* Main board */}
        <main style={{ flex: 1, padding: '24px 28px', overflowX: 'auto', overflowY: 'auto' }}>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>Application Board</h1>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>Drag cards to update status · Click to view details</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', fontSize: '13px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', borderRadius: '9px', border: '1.5px solid #ddd6fe', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ede9fe'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f5f3ff'; }}
            >
              + Add Application
            </button>
          </div>

          {isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>Loading your board...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {isError && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
              <p style={{ color: '#ef4444', fontSize: '14px', fontWeight: 500 }}>Failed to load. Please refresh.</p>
            </div>
          )}

          {!isLoading && !isError && applications.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: '16px', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
              <div style={{ fontSize: '52px' }}>📋</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '18px', fontWeight: 700, color: '#334155' }}>No applications yet</p>
                <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>Start tracking your job search journey</p>
              </div>
              <button onClick={() => setShowForm(true)} style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg, #6d28d9, #7c3aed)', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(109,40,217,0.3)' }}>
                + Add First Application
              </button>
            </div>
          )}

          {!isLoading && !isError && (
            <DragDropContext onDragEnd={onDragEnd}>
              <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content', alignItems: 'flex-start' }}>
                {COLUMNS.map((col) => {
                  const cards = byStatus(col);
                  const s = COL_STYLE[col];
                  return (
                    <div key={col} style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>

                      {/* Column header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', borderRadius: '10px', border: '1px solid #e8edf2', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{col}</span>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 9px', borderRadius: '99px', background: s.badgeBg, color: s.badgeColor }}>
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
                              border: `2px dashed ${snapshot.isDraggingOver ? '#a78bfa' : s.border}`,
                              borderRadius: '12px',
                              padding: '10px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              minHeight: '180px',
                              transition: 'all 0.2s',
                            }}
                          >
                            {cards.length === 0 && !snapshot.isDraggingOver && (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', gap: '8px' }}>
                                <span style={{ fontSize: '24px', opacity: 0.3 }}>📂</span>
                                <p style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>No applications</p>
                              </div>
                            )}
                            {cards.map((app, index) => (
                              <Draggable key={app._id} draggableId={app._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.85 : 1 }}
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
      </div>

      {showForm && <ApplicationForm onClose={() => setShowForm(false)} />}
      {selected && <ApplicationDetail app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
