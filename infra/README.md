# infra — darkroom.jerome-arfouche.ca

Production runs on the shared DigitalOcean droplet described in
`~/Code/util/infra/` (OS, nginx globals, backups, restore). This directory is
everything specific to this app. Facts as of 2026-10-23.

## Where it lives

| | |
|---|---|
| Domain | `darkroom.jerome-arfouche.ca` (port 80 → 301 to https) |
| Stack | Static Vite build served by nginx; no PHP, no Node process, no database |
| Site root | `/home/forge/darkroom.jerome-arfouche.ca/` is the git checkout itself (no `releases/`, no `current`); nginx serves `dist/` |
| TLS | Let's Encrypt via Forge, renewed Fri 09:33 (`/root/.letsencrypt-renew/2794764`) |
| Runs as | `forge` |

No daemons, cron jobs or persistent volume content.

## Files here

| File | Purpose | Applied how |
|---|---|---|
| `forge_deploy.sh` | The deploy script — identical to the one in Forge's *Deploy Script* box | Keep the two in step by hand (it isn't on the server, so `snapshot.sh` can't check it) |
| `nginx.conf` | The vhost (`/etc/nginx/sites-available/darkroom.jerome-arfouche.ca`) | By hand; `./snapshot.sh` flags drift |
| `forge-conf/` | Forge-generated includes, read-only reference (see below) | Refreshed by `./snapshot.sh` |
| `env.example` | Names of the variables in the server-side `.env` | — |
| `manifest`, `snapshot.sh` | What to compare with the server, and the script | `./snapshot.sh` |

## Deploy

1. Push to `master` → the `deploy` job in `.github/workflows/ci.yml` (after the checks pass, environment
   `production`) calls the Forge deploy-trigger URL (secret `FORGE_DEPLOY_URL`).
2. Forge runs `forge_deploy.sh` **in place** in the checkout: switches the remote to https (the repo is
   public), `git checkout .`, `git pull origin master`, `pnpm install --frozen-lockfile`, `pnpm run build`.
   `vite build` rewrites `dist/` while nginx is serving it, so there's a short window of mixed assets;
   the `no-cache` on `index.html` and 1-year `immutable` on hashed `/assets/` keep it harmless.
3. Nothing needs reloading (static files).

## nginx

`nginx.conf` is self-contained apart from the shared `snippets/bot-mitigation.conf` and the
`darkroom_api` rate-limit zone (commented out), both from `~/Code/util/infra/nginx/`. It serves
`/home/forge/darkroom.jerome-arfouche.ca/dist`, with `gzip_static`, `expires 1y; immutable` for
`/assets/`, `no-cache` for `index.html`, and an SPA fallback to `/index.html`.

Unlike the other apps it has no Forge `site.conf` include, so the vhost carries what that file would
provide: TLS 1.2/1.3 only with the same ciphers and `dhparams.pem`, `X-Frame-Options`, `X-Content-Type-Options`
and `Referrer-Policy` headers (repeated inside the locations that set their own `Cache-Control`, because
`add_header` in a location replaces inherited ones). Dotfiles are already dropped by the shared
`snippets/bot-mitigation.conf` (a second `location` for them would fail `nginx -t` as a duplicate). HSTS is
deliberately not set.

`forge-conf/` holds what Forge generated for this site:

- `before/redirect.conf` (`www.darkroom…` → apex, 301) and `before/ssl_redirect.conf` (port 80 → https, 301), included at the top of the vhost.
- `server/letsencrypt_challenge.conf` — serves ACME challenges from `/home/forge/.letsencrypt`. The vhost has its own copy of this location, so this one is redundant.
- `server/redirect_rules.conf` — a Forge "redirect" rule sending everything to `https://jerome-arfouche.ca/darkroom` (301). **It is not included by the vhost, so it has no effect today.** If the app is ever moved under the portfolio domain, this is the rule that was prepared for it.

## Leaving Forge — what needs a new owner

- **Deploy trigger** — replace the curl in `ci.yml` with SSH as `forge` running the deploy script and its exit status. The script already needs no sudo and no reload.
- **vhost includes** — inline the two `before/` redirect files and drop the `# FORGE …` include lines.
- **TLS** — the `ssl_certificate` paths are Forge-managed (`/etc/nginx/ssl/darkroom.jerome-arfouche.ca/<cert-id>/`) and change on every renewal; a replacement must keep `/.well-known/acme-challenge/` served from `/home/forge/.letsencrypt/`.
- **Atomic deploys** (optional) — build into a new directory and swap, as the release-based apps do.
