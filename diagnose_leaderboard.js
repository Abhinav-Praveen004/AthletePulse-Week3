import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: athletes, error: aErr } = await supabase.from('athletes').select('*');
  const { data: videos, error: vErr } = await supabase.from('videos').select('*');
  const { data: certs, error: cErr } = await supabase.from('certificates').select('*');

  console.log("=== ATHLETES ===");
  console.log(athletes);
  if (aErr) console.error(aErr);

  console.log("\n=== VIDEOS ===");
  console.log(videos);
  if (vErr) console.error(vErr);

  console.log("\n=== CERTIFICATES ===");
  console.log(certs);
  if (cErr) console.error(cErr);
}

check();
