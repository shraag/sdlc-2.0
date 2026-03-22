import { createClient } from '@/lib/supabase/server';
import { ProjectsList } from '@/components/dashboard/ProjectsList';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  return <ProjectsList initialProjects={projects || []} />;
}
