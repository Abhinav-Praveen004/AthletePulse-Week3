import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://watrbmfqjwgzdfsrslqs.supabase.co', 'sb_publishable_4EemSI-9jtbjh5B641LPMg_zXZ9bvo3');

async function test() {
  const { data: athletes } = await supabase.from('athletes').select('*');
  const { data: videos } = await supabase.from('videos').select('*').not('athlete_id', 'is', null);
  
  console.log("Athletes:", athletes);
  console.log("Videos:", videos);

  if (!athletes || !videos) return;

  const sports = ['cricket', 'football', 'basketball', 'badminton', 'tennis', 'hockey'];
  const newLeaderboard = {};

  sports.forEach(sport => {
    const sportVideos = videos.filter(v => v.sport.toLowerCase() === sport.toLowerCase());
    
    let rankings = athletes.map(athlete => {
      const athleteVideos = sportVideos.filter(v => v.athlete_id === athlete.id);
      if (athleteVideos.length === 0) return null;

      const scores = athleteVideos.map(v => v.score || 0).sort((a, b) => b - a);
      const bestScore = scores[0];
      const top5 = scores.slice(0, 5);
      const avgTop5 = top5.reduce((a, b) => a + b, 0) / top5.length;
      
      const hybridScore = Math.round((bestScore * 0.7) + (avgTop5 * 0.3));

      return {
        rank: 0,
        name: athlete.name,
        location: athlete.location,
        score: hybridScore,
        achievements: athleteVideos.length,
      };
    }).filter(Boolean);

    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((r, i) => r.rank = i + 1);

    newLeaderboard[sport] = rankings;
  });

  console.log(JSON.stringify(newLeaderboard, null, 2));
}

test();
