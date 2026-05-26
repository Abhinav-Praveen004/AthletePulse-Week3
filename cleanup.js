import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
  console.log("Cleaning up old anonymous data...");
  
  // Find athletes with null user_id (anonymous accounts)
  const { data: oldAthletes, error: fetchError } = await supabase
    .from('athletes')
    .select('id')
    .is('user_id', null);

  if (fetchError) {
    console.error("Error fetching old athletes:", fetchError);
    return;
  }

  console.log(`Found ${oldAthletes?.length || 0} old anonymous athletes.`);

  if (oldAthletes && oldAthletes.length > 0) {
    const oldIds = oldAthletes.map(a => a.id);
    
    // Delete videos linked to these old athletes
    const { error: vidError } = await supabase.from('videos').delete().in('athlete_id', oldIds);
    if (vidError) console.error("Error deleting videos:", vidError);
    else console.log("Deleted old videos.");

    // Delete certs linked to these old athletes
    const { error: certError } = await supabase.from('certificates').delete().in('athlete_id', oldIds);
    if (certError) console.error("Error deleting certs:", certError);
    else console.log("Deleted old certificates.");

    // Delete old athletes
    const { error: athError } = await supabase.from('athletes').delete().in('id', oldIds);
    if (athError) console.error("Error deleting athletes:", athError);
    else console.log("Deleted old athletes.");
  }
  
  // Also delete any videos that have a NULL athlete_id
  const { error: nullVidError } = await supabase.from('videos').delete().is('athlete_id', null);
  if (nullVidError) console.error("Error deleting null athlete videos:", nullVidError);
  else console.log("Deleted videos with no athlete.");

  console.log("Cleanup complete!");
}

cleanup();
