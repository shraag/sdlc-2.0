export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'completed';
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'planning' | 'active' | 'completed';
  created_at: string;
}

export type TaskType = 'epic' | 'story' | 'task' | 'bug' | 'subtask';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface AcceptanceCriterion {
  text: string;
  checked: boolean;
}

export interface Task {
  id: string;
  project_id: string;
  sprint_id: string | null;
  parent_id: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  assignee_id: string | null;
  story_points: number | null;
  estimate_hours: number | null;
  acceptance_criteria: AcceptanceCriterion[] | null;
  story_format: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  assignee?: Profile;
  children?: Task[];
}

export interface WikiPage {
  id: string;
  project_id: string;
  title: string;
  content: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bug {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  severity: Priority;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reporter_id: string | null;
  assignee_id: string | null;
  task_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  meeting_type: 'standup' | 'sprint_planning' | 'retro' | 'general';
  scheduled_at: string | null;
  duration_minutes: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Resource {
  id: string;
  project_id: string;
  name: string;
  url: string | null;
  type: 'link' | 'document' | 'design' | 'api';
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'ready' | 'running' | 'completed';
  created_by: string | null;
  created_at: string;
  // Joined
  test_cases?: TestCase[];
}

export type TestSeverity = 'blocker' | 'critical' | 'major' | 'minor';
export type TestType = 'e2e' | 'unit' | 'integration' | 'manual';

export interface TestCase {
  id: string;
  project_id: string;
  task_id: string | null;
  suite_id: string | null;
  title: string;
  description: string | null;
  steps: string | null;
  expected_result: string | null;
  preconditions: string | null;
  severity: TestSeverity;
  test_type: TestType;
  status: 'pending' | 'passed' | 'failed' | 'skipped';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIOutputEpic {
  title: string;
  description?: string;
  stories: {
    title: string;
    story_format?: string;
    criteria: string[];
    estimate_hours?: number;
  }[];
}

export interface AIOutput {
  epics: AIOutputEpic[];
}

export interface AIInsightTopic {
  title: string;
  points: {
    label: string;
    detail: string;
  }[];
}

export interface AIInsights {
  summary: string;
  key_takeaways: string[];
  topics: AIInsightTopic[];
}

export interface VoiceSession {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_company: string | null;
  project_brief: string | null;
  transcript: string | null;
  session_name: string | null;
  ai_insights: AIInsights | null;
  ai_output: AIOutput | null;
  status: 'new' | 'reviewed' | 'converted';
  project_id: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
