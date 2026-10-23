# Srikanth Rokkam · 3D portfolio

Static site. No build step. Files: `index.html`, `vendor/three.min.js` (three.js r128), `preview.png` (social card), `.nojekyll`.

## Host on GitHub Pages (free)
1. Create a repo named `srikanthrokkam.github.io` (user site, URL `https://<username>.github.io`) or any name (project site, URL `https://<username>.github.io/<repo>/`).
2. Upload everything in this folder to the repo root (keep `vendor/`).
3. Repo Settings → Pages → Source: "Deploy from a branch" → Branch `main`, folder `/ (root)` → Save.
4. Wait about a minute, then open the URL. Put it at the top of your résumé and LinkedIn.

## Edit later
- Content (jobs, dates, links, skills) is in the `STOPS`, `EXTRA`, `SKILLS` data near the top of the script in `index.html`.
- Add GitHub: set `github:` in `CONFIG`.
- Logos: fill `LOGOS` with `data:image/...` strings for the plaques.
- Custom domain: add a `CNAME` file with your domain and set DNS as GitHub describes.

## Lap board (shared top 5, anonymous)
A static site cannot write files, so a shared board needs a tiny backend. Without it the board shows the top 5 laps on the visitor's own device only.
1. Cloudflare dashboard > Workers & Pages > Create Worker, paste `lap-board-worker.js`.
2. Storage > KV > create a namespace, then Worker > Settings > Bindings > add KV binding named `LAPS`.
3. Deploy, copy the worker URL, and set `lapApi:'https://your-worker.workers.dev'` in `CONFIG` inside `index.html`.
Only lap time and timestamp are stored. The worker rejects laps under 11 s, but times come from the browser, so a determined cheater can still post a fake 13 s lap. Treat it as fun, not as a contest.
