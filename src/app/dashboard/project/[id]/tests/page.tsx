'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams } from 'next/navigation';
import {
  Plus, Loader2, FlaskConical, CheckCircle2, XCircle, MinusCircle,
  ChevronDown, ChevronRight, Play, X, Sparkles, Trash2,
} from 'lucide-react';
import type { TestCase, TestSuite, TestSeverity, TestType } from '@/types/dashboard';
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge';
import { EmptyState } from '@/components/dashboard/ui/EmptyState';
import { Modal } from '@/components/dashboard/ui/Modal';
import { ProgressBar } from '@/components/dashboard/ui/ProgressBar';
import { Tabs } from '@/components/dashboard/ui/Tabs';

const SEVERITY_COLORS: Record<string, string> = {
  blocker: 'bg-red-500',
  critical: 'bg-orange-500',
  major: 'bg-amber-500',
  minor: 'bg-emerald-500',
};

export default function TestsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const [tests, setTests] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedSuites, setExpandedSuites] = useState<Set<string>>(new Set());
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);
  const [createSuiteOpen, setCreateSuiteOpen] = useState(false);
  const [createTestOpen, setCreateTestOpen] = useState(false);
  const [suiteName, setSuiteName] = useState('');
  const [suiteDesc, setSuiteDesc] = useState('');
  const [testTitle, setTestTitle] = useState('');
  const [testDesc, setTestDesc] = useState('');
  const [testSteps, setTestSteps] = useState('');
  const [testExpected, setTestExpected] = useState('');
  const [testPreconditions, setTestPreconditions] = useState('');
  const [testSeverity, setTestSeverity] = useState<TestSeverity>('major');
  const [testType, setTestType] = useState<TestType>('e2e');
  const [testSuiteId, setTestSuiteId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [{ data: testData }, { data: suiteData }] = await Promise.all([
      supabase.from('test_cases').select('*').eq('project_id', projectId).order('created_at'),
      supabase.from('test_suites').select('*').eq('project_id', projectId).order('created_at'),
    ]);
    setTests(testData || []);
    setSuites(suiteData || []);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed').length;
  const pending = tests.filter((t) => t.status === 'pending').length;
  const passRate = tests.length > 0 ? Math.round((passed / tests.length) * 100) : 0;

  const severityCounts = { blocker: 0, critical: 0, major: 0, minor: 0 };
  tests.forEach((t) => {
    const sev = t.severity as keyof typeof severityCounts;
    if (sev in severityCounts) severityCounts[sev]++;
  });
  const maxSev = Math.max(...Object.values(severityCounts), 1);

  function getTestsForSuite(suiteId: string) {
    return tests.filter((t) => t.suite_id === suiteId);
  }

  function getOrphanTests() {
    return tests.filter((t) => !t.suite_id);
  }

  function toggleSuite(id: string) {
    setExpandedSuites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleCreateSuite(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('test_suites').insert({ project_id: projectId, name: suiteName, description: suiteDesc || null, created_by: user?.id });
    setSuiteName(''); setSuiteDesc(''); setCreateSuiteOpen(false); setSaving(false); load();
  }

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('test_cases').insert({
      project_id: projectId, suite_id: testSuiteId || null, title: testTitle,
      description: testDesc || null, steps: testSteps || null, expected_result: testExpected || null,
      preconditions: testPreconditions || null, severity: testSeverity, test_type: testType, created_by: user?.id,
    });
    setTestTitle(''); setTestDesc(''); setTestSteps(''); setTestExpected(''); setTestPreconditions(''); setTestSuiteId('');
    setCreateTestOpen(false); setSaving(false); load();
  }

  async function updateTestStatus(testId: string, status: TestCase['status']) {
    const supabase = createClient();
    await supabase.from('test_cases').update({ status }).eq('id', testId);
    load();
  }

  const tabs = [
    { key: 'dashboard', label: 'Test Dashboard' },
    { key: 'repository', label: 'Test Repository' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-dash-text-muted" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-dash-text">QA & Tests</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreateSuiteOpen(true)} className="flex items-center gap-2 rounded-lg border border-dash-border bg-dash-surface px-3 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
            <Plus className="h-3.5 w-3.5" /> New Suite
          </button>
          <button onClick={() => setCreateTestOpen(true)} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-3 py-2 text-sm font-medium hover:bg-dash-accent-hover transition cursor-pointer">
            <Plus className="h-4 w-4" /> Add Test
          </button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} className="mb-6" />

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Summary cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="rounded-xl border border-dash-border bg-dash-surface p-4">
              <p className="text-xs text-dash-text-muted mb-1">Test Cases</p>
              <p className="text-2xl font-semibold text-dash-text">{tests.length}</p>
            </div>
            <div className="rounded-xl border border-dash-border bg-dash-surface p-4">
              <p className="text-xs text-dash-text-muted mb-1">Test Suites</p>
              <p className="text-2xl font-semibold text-dash-text">{suites.length}</p>
            </div>
            <div className="rounded-xl border border-dash-border bg-dash-surface p-4">
              <p className="text-xs text-dash-text-muted mb-1">Passed</p>
              <p className="text-2xl font-semibold text-dash-success">{passed}</p>
            </div>
            <div className="rounded-xl border border-dash-border bg-dash-surface p-4">
              <p className="text-xs text-dash-text-muted mb-1">Failed</p>
              <p className="text-2xl font-semibold text-dash-error">{failed}</p>
            </div>
            <div className="rounded-xl border border-dash-border bg-dash-surface p-4">
              <p className="text-xs text-dash-text-muted mb-1">Pass Rate</p>
              <p className="text-2xl font-semibold text-dash-text">{passRate}%</p>
              <ProgressBar value={passRate} size="md" className="mt-2" />
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
              <h3 className="text-sm font-semibold text-dash-text mb-4">Severity Distribution</h3>
              <div className="space-y-3">
                {(Object.entries(severityCounts) as [string, number][]).map(([sev, count]) => (
                  <div key={sev} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-dash-text-muted capitalize">{sev}</span>
                    <div className="flex-1 h-5 bg-dash-surface-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${SEVERITY_COLORS[sev]}`} style={{ width: `${(count / maxSev) * 100}%` }} />
                    </div>
                    <span className="text-xs text-dash-text-muted w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-dash-border bg-dash-surface p-5">
              <h3 className="text-sm font-semibold text-dash-text mb-4">Test Case Status</h3>
              <div className="space-y-2">
                {tests.slice(0, 8).map((tc) => (
                  <div key={tc.id} className="flex items-center gap-2 text-xs">
                    {tc.status === 'passed' && <CheckCircle2 className="h-3 w-3 text-dash-success" />}
                    {tc.status === 'failed' && <XCircle className="h-3 w-3 text-dash-error" />}
                    {(tc.status === 'pending' || tc.status === 'skipped') && <MinusCircle className="h-3 w-3 text-dash-text-muted" />}
                    <span className="text-dash-text-secondary truncate flex-1">{tc.title}</span>
                    <span className="text-dash-text-muted capitalize">{tc.severity}</span>
                  </div>
                ))}
                {tests.length === 0 && <p className="text-xs text-dash-text-muted">No test cases yet</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repository Tab */}
      {activeTab === 'repository' && (
        <div className="flex gap-6">
          {/* Left: Suites & Tests */}
          <div className="flex-1">
            {suites.length === 0 && getOrphanTests().length === 0 ? (
              <EmptyState icon={FlaskConical} title="No test cases" description="Create test suites and test cases to ensure quality." />
            ) : (
              <div className="space-y-4">
                {suites.map((suite) => {
                  const suiteTests = getTestsForSuite(suite.id);
                  const isExpanded = expandedSuites.has(suite.id);
                  return (
                    <div key={suite.id} className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 hover:bg-dash-surface-2/50 transition">
                        <button onClick={() => toggleSuite(suite.id)} className="flex items-center gap-2 cursor-pointer">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-dash-text-muted" /> : <ChevronRight className="h-4 w-4 text-dash-text-muted" />}
                          <span className="text-sm font-semibold text-dash-text">{suite.name}</span>
                          <StatusBadge status={suite.status} />
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-dash-text-muted">{suiteTests.length} tests</span>
                          <button className="flex items-center gap-1 rounded-md border border-dash-border px-2 py-1 text-xs text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">
                            <Play className="h-3 w-3" /> Run Test Suite
                          </button>
                        </div>
                      </div>
                      {suite.description && isExpanded && (
                        <p className="px-4 pb-2 text-xs text-dash-text-muted italic">{suite.description}</p>
                      )}
                      {isExpanded && (
                        <div className="border-t border-dash-border">
                          {suiteTests.map((tc) => (
                            <button key={tc.id} onClick={() => setSelectedTest(tc)} className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-dash-border last:border-b-0 hover:bg-dash-surface-2/50 transition cursor-pointer text-left">
                              {tc.status === 'passed' && <CheckCircle2 className="h-3.5 w-3.5 text-dash-success shrink-0" />}
                              {tc.status === 'failed' && <XCircle className="h-3.5 w-3.5 text-dash-error shrink-0" />}
                              {(tc.status === 'pending' || tc.status === 'skipped') && <MinusCircle className="h-3.5 w-3.5 text-dash-text-muted shrink-0" />}
                              <span className="text-sm text-dash-text flex-1 truncate">{tc.title}</span>
                              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize ${SEVERITY_COLORS[tc.severity] ? `${SEVERITY_COLORS[tc.severity]}/10 text-${tc.severity === 'minor' ? 'emerald' : tc.severity === 'major' ? 'amber' : tc.severity === 'critical' ? 'orange' : 'red'}-400` : 'bg-dash-surface-3 text-dash-text-muted'}`}>
                                {tc.severity}
                              </span>
                            </button>
                          ))}
                          {suiteTests.length === 0 && (
                            <p className="px-4 py-3 text-xs text-dash-text-muted">No test cases in this suite</p>
                          )}
                          <button onClick={() => { setTestSuiteId(suite.id); setCreateTestOpen(true); }} className="w-full px-4 py-2 text-xs text-dash-text-muted hover:text-dash-accent transition cursor-pointer text-left">
                            + Create test case
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Orphan tests */}
                {getOrphanTests().length > 0 && (
                  <div className="rounded-xl border border-dash-border bg-dash-surface overflow-hidden">
                    <div className="px-4 py-3">
                      <span className="text-sm font-semibold text-dash-text-secondary">Unassigned Tests</span>
                    </div>
                    <div className="border-t border-dash-border">
                      {getOrphanTests().map((tc) => (
                        <button key={tc.id} onClick={() => setSelectedTest(tc)} className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-dash-border last:border-b-0 hover:bg-dash-surface-2/50 transition cursor-pointer text-left">
                          {tc.status === 'passed' && <CheckCircle2 className="h-3.5 w-3.5 text-dash-success shrink-0" />}
                          {tc.status === 'failed' && <XCircle className="h-3.5 w-3.5 text-dash-error shrink-0" />}
                          {(tc.status === 'pending' || tc.status === 'skipped') && <MinusCircle className="h-3.5 w-3.5 text-dash-text-muted shrink-0" />}
                          <span className="text-sm text-dash-text flex-1 truncate">{tc.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setCreateSuiteOpen(true)} className="text-xs text-dash-text-muted hover:text-dash-accent transition cursor-pointer">
                  + Create test suite
                </button>
              </div>
            )}
          </div>

          {/* Right: Test Detail Sidebar */}
          {selectedTest && (
            <div className="w-80 shrink-0 rounded-xl border border-dash-border bg-dash-surface p-5 max-h-[calc(100vh-200px)] overflow-y-auto dash-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-dash-text">{selectedTest.title}</h3>
                <button onClick={() => setSelectedTest(null)} className="text-dash-text-muted hover:text-dash-text cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <select value={selectedTest.status} onChange={(e) => { updateTestStatus(selectedTest.id, e.target.value as TestCase['status']); setSelectedTest({ ...selectedTest, status: e.target.value as TestCase['status'] }); }} className="rounded-md border border-dash-border bg-dash-surface-2 px-2 py-1 text-xs text-dash-text focus:outline-none cursor-pointer">
                  <option value="pending">Pending</option><option value="passed">Passed</option><option value="failed">Failed</option><option value="skipped">Skipped</option>
                </select>
                <span className="rounded-md bg-dash-surface-2 px-2 py-1 text-xs text-dash-text-muted capitalize">{selectedTest.severity}</span>
                <span className="rounded-md bg-dash-surface-2 px-2 py-1 text-xs text-dash-text-muted uppercase">{selectedTest.test_type}</span>
              </div>

              {selectedTest.description && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-dash-text-secondary">{selectedTest.description}</p>
                </div>
              )}

              {selectedTest.preconditions && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider mb-1">Preconditions</p>
                  <p className="text-sm text-dash-text-secondary">{selectedTest.preconditions}</p>
                </div>
              )}

              {selectedTest.expected_result && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider mb-1">Expected Result</p>
                  <p className="text-sm text-dash-text-secondary">{selectedTest.expected_result}</p>
                </div>
              )}

              {selectedTest.steps && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider mb-2">Steps</p>
                  <div className="space-y-2">
                    {selectedTest.steps.split('\n').filter(Boolean).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-dash-surface-2 p-3">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dash-surface-3 text-[10px] text-dash-text-muted shrink-0">{i + 1}</span>
                        <p className="text-sm text-dash-text-secondary">{step.replace(/^\d+\.\s*/, '')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-dash-text-muted mt-4">
                Created {new Date(selectedTest.created_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Suite Modal */}
      <Modal open={createSuiteOpen} onClose={() => setCreateSuiteOpen(false)} title="Create Test Suite">
        <form onSubmit={handleCreateSuite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Suite Name</label>
            <input type="text" value={suiteName} onChange={(e) => setSuiteName(e.target.value)} required placeholder="Sprint 1 MVP Tests" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Description</label>
            <textarea value={suiteDesc} onChange={(e) => setSuiteDesc(e.target.value)} placeholder="What does this suite cover?" rows={2} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateSuiteOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !suiteName.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Test Modal */}
      <Modal open={createTestOpen} onClose={() => setCreateTestOpen(false)} title="Add Test Case">
        <form onSubmit={handleCreateTest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Title</label>
            <input type="text" value={testTitle} onChange={(e) => setTestTitle(e.target.value)} required placeholder="Verify login flow" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Suite</label>
              <select value={testSuiteId} onChange={(e) => setTestSuiteId(e.target.value)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="">None</option>
                {suites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Severity</label>
              <select value={testSeverity} onChange={(e) => setTestSeverity(e.target.value as TestSeverity)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="blocker">Blocker</option><option value="critical">Critical</option><option value="major">Major</option><option value="minor">Minor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Type</label>
              <select value={testType} onChange={(e) => setTestType(e.target.value as TestType)} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3 py-2.5 text-sm text-dash-text focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition">
                <option value="e2e">E2E</option><option value="unit">Unit</option><option value="integration">Integration</option><option value="manual">Manual</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Preconditions</label>
            <input type="text" value={testPreconditions} onChange={(e) => setTestPreconditions(e.target.value)} placeholder="User is logged in..." className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Steps</label>
            <textarea value={testSteps} onChange={(e) => setTestSteps(e.target.value)} placeholder="1. Navigate to login\n2. Enter credentials\n3. Click submit" rows={3} className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-dash-text-secondary mb-1.5">Expected Result</label>
            <input type="text" value={testExpected} onChange={(e) => setTestExpected(e.target.value)} placeholder="User is redirected to dashboard" className="w-full rounded-lg border border-dash-border bg-dash-surface-2 px-3.5 py-2.5 text-sm text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:ring-1 focus:ring-dash-accent/50 transition" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setCreateTestOpen(false)} className="rounded-lg px-4 py-2 text-sm text-dash-text-secondary hover:bg-dash-surface-2 transition cursor-pointer">Cancel</button>
            <button type="submit" disabled={saving || !testTitle.trim()} className="flex items-center gap-2 rounded-lg bg-dash-accent text-white px-4 py-2 text-sm font-medium hover:bg-dash-accent-hover transition disabled:opacity-50 cursor-pointer">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
