import { createClient } from '@/lib/supabase/server';
import { SessionsList } from '@/components/dashboard/SessionsList';

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from('voice_sessions')
    .select('*')
    .order('created_at', { ascending: false });

  return <SessionsList initialSessions={sessions || []} />;
}
