-- ============================================
-- Foundry AI — Complete Database Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'member', -- 'admin' | 'member'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PROJECTS
-- ============================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text default 'active', -- 'active' | 'archived' | 'completed'
  owner_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- SPRINTS
-- ============================================
create table sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  goal text,
  start_date date,
  end_date date,
  status text default 'planning', -- 'planning' | 'active' | 'completed'
  created_at timestamptz default now()
);

-- ============================================
-- TASKS
-- ============================================
create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  sprint_id uuid references sprints(id) on delete set null,
  parent_id uuid references tasks(id) on delete cascade,
  title text not null,
  description text,
  type text default 'story', -- 'epic' | 'story' | 'task' | 'bug' | 'subtask'
  status text default 'todo', -- 'todo' | 'in_progress' | 'in_review' | 'done'
  priority text default 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  assignee_id uuid references profiles(id),
  story_points integer,
  position integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- WIKI PAGES
-- ============================================
create table wiki_pages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  content text default '',
  author_id uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- BUGS
-- ============================================
create table bugs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  severity text default 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  status text default 'open', -- 'open' | 'in_progress' | 'resolved' | 'closed'
  reporter_id uuid references profiles(id),
  assignee_id uuid references profiles(id),
  task_id uuid references tasks(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- MEETINGS
-- ============================================
create table meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  description text,
  meeting_type text default 'general', -- 'standup' | 'sprint_planning' | 'retro' | 'general'
  scheduled_at timestamptz,
  duration_minutes integer default 30,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- RESOURCES
-- ============================================
create table resources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  url text,
  type text default 'link', -- 'link' | 'document' | 'design' | 'api'
  description text,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================
-- TEST CASES
-- ============================================
create table test_cases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  task_id uuid references tasks(id) on delete set null,
  title text not null,
  description text,
  steps text,
  expected_result text,
  status text default 'pending', -- 'pending' | 'passed' | 'failed' | 'skipped'
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- VOICE SESSIONS (customer voice agent calls)
-- ============================================
create table voice_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_email text not null,
  customer_company text,
  project_brief text,
  transcript text,
  ai_output jsonb, -- {epics: [{title, stories: [{title, criteria}]}]}
  status text default 'new', -- 'new' | 'reviewed' | 'converted'
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index idx_tasks_project on tasks(project_id);
create index idx_tasks_sprint on tasks(sprint_id);
create index idx_tasks_parent on tasks(parent_id);
create index idx_tasks_assignee on tasks(assignee_id);
create index idx_sprints_project on sprints(project_id);
create index idx_bugs_project on bugs(project_id);
create index idx_wiki_project on wiki_pages(project_id);
create index idx_meetings_project on meetings(project_id);
create index idx_resources_project on resources(project_id);
create index idx_test_cases_project on test_cases(project_id);
create index idx_voice_sessions_status on voice_sessions(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table projects enable row level security;
alter table sprints enable row level security;
alter table tasks enable row level security;
alter table wiki_pages enable row level security;
alter table bugs enable row level security;
alter table meetings enable row level security;
alter table resources enable row level security;
alter table test_cases enable row level security;
alter table voice_sessions enable row level security;

-- Profiles: users can read all, update own
create policy "Profiles are viewable by authenticated users" on profiles
  for select to authenticated using (true);
create policy "Users can update own profile" on profiles
  for update to authenticated using (auth.uid() = id);

-- Projects: authenticated users can CRUD
create policy "Projects are viewable by authenticated users" on projects
  for select to authenticated using (true);
create policy "Authenticated users can create projects" on projects
  for insert to authenticated with check (true);
create policy "Authenticated users can update projects" on projects
  for update to authenticated using (true);
create policy "Authenticated users can delete projects" on projects
  for delete to authenticated using (true);

-- Sprints: authenticated users can CRUD
create policy "Sprints are viewable by authenticated users" on sprints
  for select to authenticated using (true);
create policy "Authenticated users can manage sprints" on sprints
  for all to authenticated using (true);

-- Tasks: authenticated users can CRUD
create policy "Tasks are viewable by authenticated users" on tasks
  for select to authenticated using (true);
create policy "Authenticated users can manage tasks" on tasks
  for all to authenticated using (true);

-- Wiki: authenticated users can CRUD
create policy "Wiki pages are viewable by authenticated users" on wiki_pages
  for select to authenticated using (true);
create policy "Authenticated users can manage wiki pages" on wiki_pages
  for all to authenticated using (true);

-- Bugs: authenticated users can CRUD
create policy "Bugs are viewable by authenticated users" on bugs
  for select to authenticated using (true);
create policy "Authenticated users can manage bugs" on bugs
  for all to authenticated using (true);

-- Meetings: authenticated users can CRUD
create policy "Meetings are viewable by authenticated users" on meetings
  for select to authenticated using (true);
create policy "Authenticated users can manage meetings" on meetings
  for all to authenticated using (true);

-- Resources: authenticated users can CRUD
create policy "Resources are viewable by authenticated users" on resources
  for select to authenticated using (true);
create policy "Authenticated users can manage resources" on resources
  for all to authenticated using (true);

-- Test Cases: authenticated users can CRUD
create policy "Test cases are viewable by authenticated users" on test_cases
  for select to authenticated using (true);
create policy "Authenticated users can manage test cases" on test_cases
  for all to authenticated using (true);

-- Voice Sessions: authenticated users can read, public can insert (from landing page)
create policy "Voice sessions are viewable by authenticated users" on voice_sessions
  for select to authenticated using (true);
create policy "Anyone can create voice sessions" on voice_sessions
  for insert to anon, authenticated with check (true);
create policy "Authenticated users can update voice sessions" on voice_sessions
  for update to authenticated using (true);

-- ============================================
-- TRIGGERS: auto-update updated_at
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function update_updated_at();
create trigger projects_updated_at before update on projects
  for each row execute function update_updated_at();
create trigger tasks_updated_at before update on tasks
  for each row execute function update_updated_at();
create trigger wiki_pages_updated_at before update on wiki_pages
  for each row execute function update_updated_at();
create trigger bugs_updated_at before update on bugs
  for each row execute function update_updated_at();
create trigger test_cases_updated_at before update on test_cases
  for each row execute function update_updated_at();

-- ============================================
-- FUNCTION: Create profile on signup
-- ============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
