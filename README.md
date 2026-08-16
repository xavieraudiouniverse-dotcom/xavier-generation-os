# Xavier Cut Pro

Build "XAVIER CUT PRO" — a premium AI video editing web app. NO free tier. 

Entry requires admin code "963010" OR paid subscription.

DESIGN: Dark cinematic theme. Deep blacks. Neon accents: electric blue #00D4FF, 

magenta #FF006E, gold #FFD700. Premium $100M startup feel.

PAGES:

1. Landing — feature showcase, pricing, login/register with admin code field

2. Dashboard — project grid, create new, recent projects

3. Editor — full editing interface

4. Settings — profile, subscription, billing

AUTH: Email/password + JWT. Admin code "963010" unlocks Founder tier. 

Stripe subscriptions. Middleware blocks editor without active sub.

PRICING:

- Starter $4.99/mo — 50K templates, 1080p, 10 AI/day, watermark

- Creator $9.99/mo — 250K templates, 4K, 50 AI/day, no watermark  

- Pro $19.99/mo — 750K templates, 8K, 200 AI/day, all tools

- Studio $49.99/mo — 1M+ templates, 12K, unlimited AI, white-label

EDITOR:

- Multi-track timeline (video, audio, text, effects)

- Upload: MP4, MOV, JPG, PNG, MP3, WAV

- Razor/split, ripple delete, magnetic snap

- Speed ramping, keyframes (position, scale, rotation, opacity)

- Audio waveforms, beat detection markers

- Undo/redo, auto-save every 30s

- Export: 720p-4K, MP4/MOV, platform presets (TikTok 9:16, YouTube 16:9, 

  Instagram 4:5)

AI TOOLS (mock responses with realistic delays):

- "AI Auto-Edit" — one-click suggested cut

- "Style Transfer" — 50+ styles (Ghibli, Nolan, Cyberpunk, Van Gogh)

- "Auto Captions" — transcribe to animated subtitles

- "Background Remover" — one-click green screen

- "AI Music" — generate placeholder track from mood input

- "Trend Predictor" — trending formats dashboard

TEMPLATE LIBRARY:

- Browse 1000+ templates by category: Social, Cinematic, Business, Gaming, 

  Music, Fashion

- Filter by platform, duration, style, mood

- Preview thumbnail + "Use Template" button

TECH: React 18 + TypeScript + Tailwind + Framer Motion + Zustand + 

FFmpeg.wasm + Supabase (auth, DB, storage) + Stripe.

DB TABLES:

users(id, email, role, tier, subscription_status, admin_code)

projects(id, user_id, title, timeline_json, thumbnail, updated_at)

media(id, user_id, project_id, url, type, ai_tags_json)

templates(id, name, category, thumbnail, tier_required, template_json)

exports(id, project_id, format, resolution, status, url)

Make it cinematic. Premium. Fast. Hollywood-director feel.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://xavier-generation-os.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0013b83-41f5-4a7b-8f3a-6a916b445cd7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
