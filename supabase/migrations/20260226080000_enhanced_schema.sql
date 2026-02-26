-- Enhanced schema for intelligence layer

-- Voice sessions: add AI insights and session name
ALTER TABLE voice_sessions ADD COLUMN IF NOT EXISTS session_name text;
ALTER TABLE voice_sessions ADD COLUMN IF NOT EXISTS ai_insights jsonb;

-- Tasks: add hour estimates, acceptance criteria, story format
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimate_hours numeric;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS acceptance_criteria jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS story_format text;

-- Test suites
CREATE TABLE IF NOT EXISTS test_suites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'draft',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_test_suites_project ON test_suites(project_id);

-- Enable RLS on test_suites
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Test suites viewable by authenticated" ON test_suites
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can manage test suites" ON test_suites
  FOR ALL TO authenticated USING (true);

-- Test cases: add suite reference, severity, preconditions, test type
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS suite_id uuid references test_suites(id) on delete set null;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS severity text default 'major';
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS preconditions text;
ALTER TABLE test_cases ADD COLUMN IF NOT EXISTS test_type text default 'e2e';
