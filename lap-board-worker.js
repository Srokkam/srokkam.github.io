// Cloudflare Worker for the anonymous lap board (free tier). Stores only lap time + timestamp. No names, no IPs kept.
// Setup: Workers & Pages > Create Worker > paste this. Storage: KV namespace bound as LAPS. Then set CONFIG.lapApi in index.html to the worker URL (no trailing slash).
const MIN_LAP = 11;      // seconds: the track is ~400 m and top speed ~137 km/h, so anything faster is not a real lap
const MAX_LAP = 600;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (url.pathname !== '/laps') return json({ error: 'not found' }, 404);
    let list = JSON.parse((await env.LAPS.get('top')) || '[]');
    if (req.method === 'POST') {
      let t;
      try { t = Number((await req.json()).t); } catch (e) { return json({ error: 'bad body' }, 400); }
      if (!isFinite(t) || t < MIN_LAP || t > MAX_LAP) return json({ error: 'implausible lap' }, 400);
      // light rate limit: one submission per client per minute (hash of IP, expires automatically)
      const ip = req.headers.get('CF-Connecting-IP') || 'x';
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(ip + 'lap-salt'));
      const key = 'rl:' + [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, '0')).join('');
      if (await env.LAPS.get(key)) return json(list, 429);
      await env.LAPS.put(key, '1', { expirationTtl: 60 });
      list.push({ t: Math.round(t * 10) / 10, at: Date.now() });
      list.sort((a, b) => a.t - b.t);
      list = list.slice(0, 5);
      await env.LAPS.put('top', JSON.stringify(list));
    }
    return json(list);
  },
};
