import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { gqlSdk } from '../graphql/client';
import { useLocalization } from '../hooks/useLocalization';
import TaskCard from '../components/tasks/TaskCard';
import type { TaskFieldsFragment } from '../components/tasks/TaskCard';
import CreateCustomTaskForm from '../components/tasks/CreateCustomTaskForm';

const TaskHistoryList = lazy(() => import('../components/tasks/TaskHistoryList'));

type TasksTabProps = {
  isAuthenticated: boolean;
};

type SectionView = 'tasks' | 'history';

const TasksTab: React.FC<TasksTabProps> = ({ isAuthenticated }) => {
  const { t } = useLocalization();

  const [tasks, setTasks] = useState<TaskFieldsFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [sectionView, setSectionView] = useState<SectionView>('tasks');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const hasLoadedRef = useRef(false);

  const defaultTasks = tasks.filter((t) => t.type !== 'CUSTOM');
  const customTasks = tasks.filter((t) => t.type === 'CUSTOM');

  const fetchTasks = useCallback(async () => {
    const { me } = await gqlSdk.GetTasks();
    setTasks(me.player.tasks.tasks as TaskFieldsFragment[]);
  }, []);

  // Initial load
  useEffect(() => {
    if (!isAuthenticated || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    fetchTasks()
      .catch((err) => console.error('[TasksTab] initial load failed:', err))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setContentLoaded(true), 50);
      });
  }, [isAuthenticated, fetchTasks]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      setContentLoaded(true);
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated]);

  const handleTaskUpdated = useCallback((updatedTask: TaskFieldsFragment) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }, []);

  const handleCustomTaskCreated = useCallback((newTask: TaskFieldsFragment) => {
    setTasks((prev) => [...prev, newTask]);
    setShowCreateForm(false);
  }, []);

  // Skeleton loader on initial load
  if (loading) {
    return (
      <div className="tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden">
        <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="text-center mb-8">
              <div
                className="h-8 rounded-lg w-48 mx-auto mb-3 animate-pulse"
                style={{ background: 'rgba(220,235,245,0.1)' }}
              />
              <div
                className="h-4 rounded-lg w-64 mx-auto animate-pulse"
                style={{ background: 'rgba(220,235,245,0.07)' }}
              />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl animate-pulse"
                style={{ background: 'rgba(220,235,245,0.05)' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="tab-page-wrapper fixed inset-0 overflow-y-auto overflow-x-hidden"
      style={{
        opacity: contentLoaded ? 1 : 0,
        transform: contentLoaded ? 'translateY(0)' : 'translateY(10px)',
        transition: contentLoaded ? 'opacity 0.4s ease-out, transform 0.4s ease-out' : 'none',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="tab-inner-content relative z-10 min-h-screen pt-16 md:pt-20 px-4 md:px-6 pb-24">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6">
            <h1
              className="text-2xl sm:text-3xl font-tech font-bold mb-2 tracking-tight"
              style={{
                color: '#e8f4f8',
                textShadow: '0 0 8px rgba(180,220,240,0.3)',
              }}
            >
              {t('tasks.title')}
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'rgba(220,235,245,0.6)' }}
            >
              {t('tasks.subtitle')}
            </p>
            <div
              className="w-24 h-0.5 rounded-full mx-auto mt-4"
              style={{
                background: 'rgba(180,220,240,0.5)',
                boxShadow: '0 0 8px rgba(180,220,240,0.3)',
              }}
            />
          </div>

          {/* Section toggle: Tasks / History */}
          <div className="flex justify-center mb-6">
            <div
              className="inline-flex rounded-full p-1"
              style={{
                background: 'rgba(220,235,245,0.08)',
                border: '1px solid rgba(220,235,245,0.12)',
                backdropFilter: 'blur(10px)',
              }}
            >
              {(['tasks', 'history'] as SectionView[]).map((view) => {
                const isActive = sectionView === view;
                const label =
                  view === 'tasks' ? t('navigation.tasks') : t('tasks.taskHistory');
                return (
                  <button
                    key={view}
                    onClick={() => setSectionView(view)}
                    className="relative px-5 py-2 rounded-full font-tech font-medium text-sm transition-all duration-200"
                    style={
                      isActive
                        ? {
                            background: 'rgba(220,235,245,0.15)',
                            color: '#e8f4f8',
                            boxShadow:
                              '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                          }
                        : {
                            background: 'transparent',
                            color: 'rgba(220,235,245,0.6)',
                          }
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tasks section */}
          {sectionView === 'tasks' && (
            <div className="space-y-6">

              {/* Default Tasks */}
              <section>
                <h2
                  className="font-tech font-semibold text-sm mb-3 px-1"
                  style={{ color: 'rgba(220,235,245,0.7)' }}
                >
                  {t('tasks.defaultTasks')}
                </h2>
                <div className="space-y-3">
                  {defaultTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onTaskUpdated={handleTaskUpdated}
                    />
                  ))}
                </div>
              </section>

              {/* Custom Tasks */}
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2
                    className="font-tech font-semibold text-sm"
                    style={{ color: 'rgba(220,235,245,0.7)' }}
                  >
                    {t('tasks.customTasks')}
                  </h2>
                  {!showCreateForm && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-tech font-semibold text-xs transition-all duration-150 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, rgba(180,220,240,0.15) 0%, rgba(160,210,235,0.08) 100%)',
                        border: '1px solid rgba(180,220,240,0.25)',
                        color: 'rgba(180,220,240,0.9)',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M5 1V9M1 5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {t('tasks.createTask')}
                    </button>
                  )}
                </div>

                {/* Create form */}
                {showCreateForm && (
                  <div className="mb-3">
                    <CreateCustomTaskForm
                      onCreated={handleCustomTaskCreated as any}
                      onClose={() => setShowCreateForm(false)}
                    />
                  </div>
                )}

                {/* Custom task cards */}
                {customTasks.length > 0 ? (
                  <div className="space-y-3">
                    {customTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                ) : !showCreateForm ? (
                  <div
                    className="rounded-2xl p-6 text-center"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <p
                      className="font-tech text-sm"
                      style={{ color: 'rgba(220,235,245,0.4)' }}
                    >
                      {t('tasks.noTasks')}
                    </p>
                  </div>
                ) : null}
              </section>
            </div>
          )}

          {/* History section */}
          {sectionView === 'history' && (
            <section>
              <Suspense
                fallback={
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 rounded-xl animate-pulse"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    ))}
                  </div>
                }
              >
                <TaskHistoryList />
              </Suspense>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksTab;
