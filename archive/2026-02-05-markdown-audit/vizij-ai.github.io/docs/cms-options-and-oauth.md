<!-- Archived from vizij-ai.github.io/docs/cms-options-and-oauth.md on 2026-02-05 -->
<!-- Reason: superseded or historical planning note; preserved for reference. -->

# CMS Options and OAuth Hosting Guide (GitHub Pages + Decap)

Audience: Maintainers and contributors of the Semio Community website  
Status: Draft  
Last updated: YYYY-MM-DD

## Context and Goals

We want:
- A CMS UI where editors can log in to manage content.
- Content remains versioned in Git as Markdown/MDX under `src/content/**`.
- The site continues to build and deploy on GitHub Pages (DNS via Squarespace).
- Minimal operational overhead, secure authentication, and compatibility with our Astro Content Collections/Zod schemas.

This document outlines Git-based CMS options that fit our stack and describes practical ways to host the OAuth bridge needed by Decap (and similar Git-backed CMSes) when the site is hosted on GitHub Pages.

## Requirements for a Git-based CMS

- Git as source of truth (no separate DB).
- MD/MDX content + frontmatter, with support for relations between collections (people, organizations, etc.).
- Editors authenticate in a browser, CMS commits to the GitHub repo via PRs/commits.
- OAuth flow that can securely exchange a GitHub `code` for an access token (must be done on a server—not in the static site).

## Options Overview (Tailored to This Repo)

1) Decap CMS (formerly Netlify CMS)
- Model: Git-backed, hosted in the site at `/admin`.
- Auth: 
  - Git Gateway (requires Netlify Identity) OR
  - GitHub backend with a small OAuth bridge you host.
- Pros: Mature, simple, good editorial workflow, easy to set up, works great with GitHub Pages.
- Cons: If not using Netlify Identity, you need to host a tiny OAuth server.

2) Keystatic
- Model: Git-backed, strongly typed TypeScript config, polished admin UI, MDX-ready, relationship fields.
- Auth: GitHub OAuth (also needs a small auth server when the site is fully static).
- Pros: First-class TS developer experience; elegant UI; great parity with Zod schemas.
- Cons: Similar OAuth server requirement on static hosting.

3) TinaCMS (Tina Cloud)
- Model: Git-backed content with a hosted SaaS for auth and a GraphQL layer.
- Auth: Tina Cloud (no separate auth server required).
- Pros: Minimal ops; very nice editing UX; commits to GitHub.
- Cons: Vendor lock-in and cost. Some runtime JS for the editor app.

4) CloudCannon / Stackbit (SaaS Git CMS)
- Model: Hosted editorial UI that commits to GitHub.
- Pros: Very easy for editors; no auth server to run.
- Cons: Paid SaaS; less code-first control.

Recommendation:
- Open-source and simple: Decap CMS with GitHub backend + a small OAuth bridge we host.
- If you want minimal ops and don’t mind SaaS: Tina CMS (Tina Cloud).
- If you prefer typed configs and parity with TS/Zod: Keystatic + small OAuth bridge.

## Decision Matrix (Short)

- Keep content in Git: All options above.
- Zero new infra: Tina Cloud (SaaS), CloudCannon/Stackbit (SaaS).
- Minimal cost, open-source: Decap or Keystatic + small OAuth bridge (host on Firebase/Vercel/etc.).
- Strong TS/Schema typing: Keystatic > Decap.
- Fastest to pilot: Decap.

## Decap CMS: Config Shape and Content Mapping

- We place a static admin app at `/public/admin/index.html`.
- We configure `public/admin/config.yml` to define:
  - `backend` (GitHub + OAuth bridge URLs)
  - `media_folder` and `public_folder`
  - `collections` matching our `src/content/*` folders and frontmatter fields (ID, metadata, and `body`).
- MDX support:
  - Use `format: frontmatter` and `extension: "mdx"`.
- Relations:
  - Use `widget: relation` to reference IDs across collections (e.g., `organizationId` in people affiliations).

Example (simplified):
```yml
backend:
  name: github
  repo: semio-community/semio-community.github.io
  branch: main
  base_url: https://<your-oauth-bridge-host>
  auth_endpoint: /auth

media_folder: "public/uploads"
public_folder: "/uploads"
publish_mode: editorial_workflow
# For Astro image() pipeline, consider:
# use_relative_media_paths: true

collections:
  - name: people
    label: People
    folder: "src/content/people"
    create: true
    extension: "mdx"
    format: "frontmatter"
    slug: "{{slug}}"
    fields:
      - { name: id, label: ID, widget: string }
      - { name: name, label: Name, widget: string }
      - label: Affiliations
        name: affiliations
        widget: list
        fields:
          - { name: organizationId, label: Organization, widget: relation, collection: organizations, search_fields: ["name", "id"], value_field: "id", display_fields: ["name"] }
          - { name: role, label: Role, widget: string }
      - { name: featured, label: Featured, widget: boolean, default: false }
      - { name: draft, label: Draft, widget: boolean }
      - { name: body, label: Body, widget: markdown, required: false }

  - name: organizations
    label: Organizations
    folder: "src/content/organizations"
    create: true
    extension: "mdx"
    format: "frontmatter"
    slug: "{{slug}}"
    fields:
      - { name: id, label: ID, widget: string }
      - { name: name, label: Name, widget: string }
      - { name: description, label: Description, widget: text }
      - { name: featured, label: Featured, widget: boolean, default: false }
      - { name: draft, label: Draft, widget: boolean }
      - { name: body, label: Body, widget: markdown, required: false }
```

### Image Handling with Astro Content

Our Zod schemas use `image()` for some fields, which works best when images are co-located with MDX (importable assets in `src/`). CMS defaults often upload to a public folder, which bypasses `image()` parsing.

Two viable strategies:

- Strategy A: Keep `image()` pipeline
  - Set `use_relative_media_paths: true`
  - Store images next to each entry (`src/content/<collection>/<entry>/image.png`)
  - Editors upload images in the CMS; paths resolve relative to the MDX file.
- Strategy B: Central public uploads
  - Set `media_folder: public/uploads` and `public_folder: /uploads`
  - Relax Zod schema to accept `string | ImageMetadata` and handle both in components.

Example schema relaxation (conceptual):
```ts
// Instead of strictly image(), allow strings too:
images: z.object({
  hero: z.union([image(), z.string()]).optional(),
  logo: z.union([image(), z.string()]).optional(),
}).optional()
```

## Authentication Strategies for Decap

Decap needs a Git provider token. On GitHub Pages, you have two practical paths:

1) Netlify Identity + Git Gateway (Auth-as-a-Service)
- Keep hosting on GitHub Pages; create a Netlify site solely for Identity + Git Gateway.
- Connect the repo in Netlify, enable Identity, enable Git Gateway.
- Editors log in via Netlify Identity; Git Gateway securely performs GitHub operations.
- Pros: No custom OAuth server, fast setup.
- Cons: Introduces Netlify dependency (auth-only).

2) GitHub Backend + Custom OAuth Bridge (Fully GitHub-centric)
- Use Decap’s GitHub backend and host a tiny OAuth server to exchange the `code` for an access token.
- The OAuth server stores the GitHub client secret, validates `state`, and returns a token to the CMS admin.
- Pros: No Netlify dependency; entirely GitHub-based.
- Cons: You maintain a small service, but it’s very lightweight.

## Hosting Options for the OAuth Bridge

These options all work well; pick the platform you’re already using or prefer operationally.

### A) Firebase (Functions v2 or Cloud Run)

- Good fit if you already use Firebase/GCP.
- Implementation:
  - Create a small Node/Express app (or use existing tiny OSS bridges) exposing:
    - `GET /auth` → redirect to GitHub authorize URL
    - `GET/POST /callback` → exchange code for token, respond to Decap
  - Use Firebase Functions (2nd gen) or deploy to Cloud Run.
  - Store `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` in Secret Manager.
  - Restrict CORS to your domain/admin path.

- Pros: Low ops, scalable, good observability.
- Cons: Cold starts possible (mitigated with min instances).

### B) Vercel (Serverless Functions)

- Rapid to deploy with great DX.
- Implementation:
  - Create `/api/auth` and `/api/callback` serverless functions.
  - Store secrets in Vercel environment variables.
  - Configure allowed origins.

- Pros: Fastest to prototype; no servers to manage.
- Cons: Free tier limits, cold starts on some plans.

### C) Cloudflare Workers / Pages Functions

- Edge runtime with global distribution and great free tier.
- Implementation:
  - Implement the same two endpoints using Workers (e.g., Hono/itty-router).
  - Add secrets via Wrangler.
  - Enforce CORS/redirect URI checks.

- Pros: Global, fast, very cost-effective.
- Cons: Porting small Express examples to Workers runtime (simple, ~50 lines).

### D) Render / Railway (Managed Web Services)

- Straightforward “web service” hosts for small Node apps.
- Implementation:
  - Run a minimal Node/Express OAuth bridge.
  - Configure environment variables, CORS, custom domain.

- Pros: Very simple; persistent service.
- Cons: Keep-alive concerns on free tiers.

### E) AWS Lambda + API Gateway (or Azure Functions / GCP Functions)

- Enterprise-grade serverless.
- Implementation:
  - Use a function + API Gateway routing for `/auth` and `/callback`.
  - Secrets in AWS Secrets Manager or parameter store.
  - CORS via API Gateway.

- Pros: Robust and scalable.
- Cons: More setup overhead unless you use frameworks (SAM/Serverless).

### F) Supabase Edge Functions

- If you already use Supabase, Edge Functions are easy.
- Implementation:
  - Implement OAuth endpoints with Deno runtime.
  - Store secrets in Supabase config.
  - Restrict CORS.

- Pros: Minimal ops; good developer experience.
- Cons: Another runtime flavor; documentation scattered.

### G) Your Own VM/Kubernetes

- Run a tiny Node service behind a reverse proxy.
- Pros: Maximum control; reuse existing infra.
- Cons: You manage uptime, TLS, patching.

## Security Considerations

- Scopes:
  - Use `public_repo` for public repos; `repo` for private repos.
- CSRF:
  - Generate and validate a `state` parameter on the OAuth flow.
- Redirect URIs:
  - Whitelist only the expected callback URL(s).
- CORS:
  - Restrict allowed origins to the admin UI domain.
- Secrets:
  - Keep `GITHUB_CLIENT_SECRET` server-side only (secrets manager).
  - Never log tokens; rotate secrets periodically.
- Rate limits:
  - Use GitHub’s recommended flows; keep logs to diagnose issues.
- Token handling:
  - Return only the minimal token info Decap expects; avoid long-lived tokens if possible.

## Editorial Workflow with GitHub Pages

- Use Decap editorial workflow (draft → PR → review → merge).
- GitHub Actions builds the site on merge to `main` and publishes to Pages.
- For previewing PRs:
  - Optional: configure a second static host (e.g., Cloudflare Pages or Vercel) for PR previews, or publish build artifacts via GH Actions and post links on PRs.
  - Decap’s preview panes can help for simple content checks.

## Implementation Checklist (Decap + GitHub Backend)

1) Create GitHub OAuth App
- Homepage URL: your site or admin URL.
- Authorization callback URL: your OAuth bridge `/callback` endpoint.

2) Deploy OAuth Bridge
- Choose Firebase, Vercel, Cloudflare Workers, etc.
- Implement `/auth` (redirect to GitHub) and `/callback` (exchange code → token).
- Add CORS and state validation.

3) Add Decap Admin to the Site
- Place `public/admin/index.html` loading Decap.
- Create `public/admin/config.yml` with:
  - `backend: { name: github, repo, branch, base_url, auth_endpoint }`
  - `collections` mapping to `src/content/**` with MDX/fields.
  - `media_folder` + `public_folder` and `use_relative_media_paths` as chosen.

4) Configure Collections and Relations
- People, Organizations, Hardware, Software, Research, Events.
- Use `widget: relation` for cross-references.

5) Decide on Image Strategy
- Prefer relative assets for `image()`, or relax schema to accept `string | ImageMetadata`.

6) Test End-to-End
- Login → create draft → save → open PR → merge → GH Pages deploy.
- Validate content renders with Astro Content Collection schemas.

7) Document Editor Onboarding
- How to access `/admin`, who can log in (GitHub org/team), and review/merge process.

## FAQ

- Can we use Slack as OAuth?
  - Not for Decap’s GitHub backend. Decap needs a GitHub token to write to the repo; Slack cannot mint GitHub tokens. You can gate `/admin` with Slack SSO separately, but Decap still needs GitHub OAuth behind the scenes.

- Do we need to host the site on Netlify to use Decap?
  - No. You can keep GitHub Pages. Either:
    - Use Netlify Identity + Git Gateway (Netlify auth-only), or
    - Use Decap with GitHub backend + your own OAuth bridge.

- What about private repos?
  - Use `repo` scope (instead of `public_repo`) in the OAuth app.

- How do we restrict who can edit?
  - With GitHub backend, only users with access to the repo (and successful GitHub auth) can edit. For Git Gateway, control access via Netlify Identity roles/invites.

## Recommended Path for Semio Community

- Pilot Decap CMS with GitHub backend + OAuth bridge on Firebase (Functions v2) or Vercel:
  - Fast to deploy, low ops, open-source.
  - Keeps GitHub Pages deployments unchanged.
- Start with 1–2 collections (People, Organizations), verify editor UX, then expand to Hardware/Software/Research/Events.
- Prefer relative media (keeps `image()` happiest). If the editorial team prefers central uploads, relax schemas to accept string paths.

Once the pilot is successful, document the editor workflow and access instructions in `docs/` and invite initial editors for testing.