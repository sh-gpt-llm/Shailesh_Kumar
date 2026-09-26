# Shailesh Kumar — Personal Brand Site

A modern, animated personal-brand website built with [Astro](https://astro.build) + Tailwind CSS v4.
Showcases the career journey (2007 → 2026), core competencies, consulting offerings, and a **no-code blog/writing
section** you can edit entirely from the browser — no coding required to publish a post.

## ✨ What's inside

- **Home** — animated gradient hero, live career stats, current role, featured writing.
- **Journey** (`/journey`) — full career timeline 2007–2026 built from real career data (`src/data/career.ts`).
- **What I Do** (`/work`) — consulting/advisory offerings + full capability map.
- **Writing** (`/writing`) — blog, research, patterns, architecture, and strategy posts. Content lives as
  Markdown files in `src/content/writing/`.
- **Contact** (`/contact`) — simple, direct contact links.
- **/admin** — a visual content editor ([Sveltia CMS](https://sveltiacms.app), the actively-maintained
  successor to Netlify/Decap CMS) for writing, editing, and publishing posts with zero code. This is the
  "editable page" requested — a rich Markdown editor with fields for title, description, category, tags,
  cover image, and draft/publish toggle.

## 🎨 Design

Dark, bold-gradient, animated "portfolio-agency" style: glassmorphism cards, glowing gradient borders,
floating animated blobs, and scroll-reveal animations — built with plain CSS/Tailwind, no heavy JS framework
needed, so the site stays extremely fast.

## 🧱 Tech stack

- [Astro](https://astro.build) (static site generator, ships zero JS by default)
- Tailwind CSS v4 + `@tailwindcss/typography` for the blog post prose
- [Sveltia CMS](https://sveltiacms.app) for no-code content editing (git-based — every published post
  becomes a real, versioned Markdown file in this repo). Note: Decap CMS's Netlify Identity + Git Gateway
  backend was discontinued by Netlify, so this project uses Sveltia CMS's GitHub backend instead.
- Netlify (recommended host — free tier, easy custom domain)

## 🚀 Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321`.

## 📦 Deploying to a public domain (step-by-step)

This site is designed to deploy on **Netlify's free tier**.

### 1. Push this project to GitHub
```bash
git init
git add -A
git commit -m "Initial personal brand site"
# create a new empty repo on github.com, then:
git remote add origin https://github.com/<your-username>/shailesh-kumar-brand.git
git branch -M main
git push -u origin main
```

### 2. Connect to Netlify
1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Pick your GitHub repo. Build command: `npm run build`. Publish directory: `dist`. (Already configured in `netlify.toml`.)
3. Deploy — you'll get a free `https://<random-name>.netlify.app` URL immediately.
4. New Netlify projects are **private by default**. Once you have a successful deploy, click **Make public**
   in the pre-launch toolbar (or Project configuration → General → Visitor access) so anyone can view it.

### 3. Enable the no-code editor (`/admin`)
`public/admin/config.yml` already points at this repo's GitHub backend. To log in:
1. On GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Scope it to this repository only, with **Contents: Read and write** (and **Pull requests: Read and write**
   if you ever enable the editorial workflow).
3. Visit `https://<your-site>.netlify.app/admin`, click **Sign In with Token**, and paste the token.
4. You can now create, edit, and delete posts visually. Every save creates a real commit to this GitHub repo
   and triggers an automatic Netlify rebuild.

To let someone else edit content too, just invite them to the GitHub repo with write access — no extra
CMS configuration needed.

### 4. Add your custom domain
1. Buy a domain (e.g. via Namecheap, GoDaddy, Google Domains, Cloudflare Registrar — any registrar works).
2. In Netlify: **Site configuration → Domain management → Add a domain**.
3. Point your domain's DNS to Netlify (Netlify shows the exact records — usually an `A` record to Netlify's
   load balancer + a `CNAME` for `www`), or transfer DNS to Netlify DNS for the simplest setup.
4. Netlify automatically provisions a free HTTPS certificate (Let's Encrypt) once DNS resolves.

Your site is now live on your own domain, publicly accessible, and editable from any browser at `/admin`.

## ✍️ Writing a new post without the CMS UI (optional, manual method)

Add a new Markdown file to `src/content/writing/your-post-slug.md`:

```md
---
title: "Your Post Title"
description: "One or two sentence summary shown on the writing index."
date: 2026-09-26
category: "Blog" # Blog | Research | Pattern | Architecture | Strategy | Consulting
tags: ["tag1", "tag2"]
featured: false
draft: false
---

Your content in Markdown goes here.
```

## 📁 Project structure

```
src/
  content/writing/     # every blog/research/pattern/strategy post (Markdown)
  content.config.ts    # content collection schema
  data/career.ts        # career timeline, competencies, stats — edit this to update your journey
  layouts/BaseLayout.astro
  components/           # SectionHeading, TimelineItem, PostCard
  pages/                 # index, journey, work, writing, contact
public/
  admin/                 # Sveltia CMS no-code editor (index.html + config.yml)
```
