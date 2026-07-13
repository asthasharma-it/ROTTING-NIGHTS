@AGENTS.md

# Rotting Nights

A personal, dark-themed movie & series tracker. Mood/genre browsing, a 5-way status system (Nope/Maybe/Definitely/Ongoing/Watched), 1–5 ratings, episode progress tracking, streaming platform logos, and a one-time taste quiz that feeds a lightweight genre-weighted recommendation engine.

**Product goal (Krish's own words):** solve decision paralysis — "so many weird options I end up choosing nothing." The Home page is deliberately curated/personalized-only, not a generic browse dump; generic browsing (genre/language/region) lives behind a dedicated `/browse` page reachable from the top nav instead.

## Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Prisma + SQLite locally (`prisma/schema.prisma`, `prisma/dev.db`) — production will need a hosted Postgres (SQLite doesn't persist on serverless hosts)
- NextAuth v5 (`lib/auth.ts`) — Google OAuth when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set, otherwise falls back to a "Continue as Guest" credentials provider so the app is always testable
- TMDB API (`lib/tmdb.ts`) for all movie/show data, posters, cast, and watch-provider (streaming logo) info, region `IN`. Falls back to a small mock catalog (`lib/mock-data.ts`) when `TMDB_API_KEY` is unset.

## Env vars (`.env`, gitignored)
`DATABASE_URL`, `TMDB_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`. See `.env.example`.

## Conventions
- Genre/mood slugs are our own vocabulary, mapped to TMDB genre IDs in `lib/genres.ts` (TV doesn't have real Horror/Thriller/Rom-Com genres on TMDB, so those are best-effort mapped to the closest equivalent).
- Server components fetch TMDB/Prisma data directly; API routes (`app/api/*`) exist only where the client needs to fetch dynamically (status/rating/progress/quiz CRUD, and `/api/tmdb/search` used by Search + genre/mood "Load more" pagination).
- Status tagging and rating are optimistic client components (`StatusButtons`, `RatingStars`) that call the API routes directly.
- Poster cards (`PosterCard` + `PosterOverlay`) reveal the 5 status icons as a hover/tap overlay on the poster image itself, not as a persistent row below it — first tap reveals on touch devices, second tap (or a normal click after desktop hover) navigates through.
- Session is seeded server->client via `<SessionProvider session={session}>` in `app/layout.tsx` to avoid a client hydration race where a freshly-signed-in user's first click could bounce them back to `/signin`.
- Guest sign-in (`components/GuestSignInForm.tsx`) uses the *client* `signIn()` + a hard `window.location.href` redirect rather than a server action + `redirectTo`. A same-site server-action redirect after credentials sign-in left Next.js's client router cache serving the stale (pre-sign-in) root layout, so the Navbar kept showing "Sign in" for a few seconds even though the page content was already personalized. Google sign-in doesn't need this treatment since the OAuth round-trip through Google is already a hard navigation.
- TMDB calls (`lib/tmdb.ts`) retry up to 4 times with backoff (0/300/800/1500ms) on transient network failure, and use `withConcurrencyLimit` to cap simultaneous in-flight requests — this network path has shown multi-second *sustained* bad windows (several consecutive connection failures), not just single blips, confirmed independently via raw `curl` outside the app. A genuine TMDB 404 (`TmdbNotFoundError`) skips retries entirely and is never retried as if it might be transient.
- `getDetails()` swallows all failures to `null` (safe for list/row contexts). The title detail page uses `fetchDetailsRaw()` directly instead, so it can tell a real 404 (`notFound()`) apart from "TMDB unreachable after retries" (friendly "couldn't load, try again" state with a working retry link) — a bare 404 for a title that actually exists was a real bug that shipped and was caught via the "Pick something for me" button landing on one.
- Regional/language browsing (`lib/regions.ts`, `getByRegion`) — Bollywood/Anime/Korean/Japanese/Chinese/Thai, plus drama-specific cuts (Korean/Japanese/Thai/Chinese/Turkish Drama, via `requireGenreId` = Drama) since Krish is primarily a drama viewer and the general regions were burying dramas under each language's action/comedy/etc. Filters TMDB discover by `with_original_language` (+ genre restriction where set), exposed via `/browse` (chips), Search's language dropdown, and `/region/[slug]` pages. Deliberately *not* shown on Home — see product goal above.
- Nothing is ever actually "missing" from the catalog (TMDB has ~1M+ titles) — apparent gaps are a *discoverability* problem, not a data problem. Confirmed directly: "Red, White & Royal Blue" was reported missing but was already searchable and correctly genre-tagged; the real gaps were missing browse categories (no Thai, no drama-specific cuts), which is what got fixed. Before adding "missing" content, check Search / a direct TMDB query first — the fix is almost always a new category or better labeling, not new data.
- Streaming providers (`Provider.type`) are split into `stream` vs `rent`/`buy` and shown as two labeled groups in `StreamingLogos`, since subscription-only data was too sparse to be useful on its own.
- Anywhere movie + tv results from two separate TMDB calls get merged into one capped-length list (e.g. `getUpcoming`), interleave them before slicing — concatenating movies-then-tv and slicing afterward silently drops every tv result once a full page of movies fills the cap.
- "Because you liked X" rows use TMDB's `/recommendations` endpoint (behavior-based), not `/similar` (genre/keyword-based) — `/similar` was tested and produced noticeably noisier, more obscure matches.
- Any per-item `getDetails()` fan-out driven by a user's own list (ratings, tagged items, ongoing shows) must go through `withConcurrencyLimit` — those lists have no natural cap and grow with usage, unlike a fixed catalog fetch.

## Home page behavior
- Deliberately short and decision-focused, not a generic content dump: greeting → **Featured Hero** (Netflix-style backdrop + click-to-play trailer for your #1 pick, with a "🔀 Try another" shuffle) → **Pick something for me** → Continue Watching → Recommended for you → Because you liked X → mood picker (compact chip row, not a big grid — moved *below* the personalized rows so it doesn't compete with them for attention) → Trending → New & coming soon.
- Genre/mood/region browsing chips live on `/browse` (top nav), not Home, to keep Home from turning back into "too many options."
- **Cold start**: a brand-new account (no quiz answers, no ratings) is redirected straight to `/onboarding` from the Home page server component itself, rather than shown a skippable banner — Home with zero personalization is just Trending wearing a "for you" label, which undermines the whole premise. Fires every visit until the user either completes the quiz or rates anything at all; never fires again after that.
- "Continue Watching" row (Ongoing-status titles) shows right after the hero when present — highest-priority personal content.
- "Recommended for you" excludes any title the user has already tagged with *any* status, so it keeps surfacing fresh titles instead of repeating ones already on the list.
- Both the **Featured Hero** and **"Pick something for me"** pool are deliberately narrow — `recommended.slice(0, 8)` (or the top of the because-you-liked pool, or trending only as an absolute last resort for a brand-new account with zero taste signal). Earlier version drew from the full 24-item recommended list; narrowing to the top 8 made picks feel meaningfully "for you" rather than arbitrary, per direct feedback ("it should be based on my interest... not just anything").
- `FeaturedHero` (`components/FeaturedHero.tsx`) fetches the trailer key via TMDB's `videos` append (prefers official Trailer, falls back to any Trailer, then Teaser) and only shows the "Play trailer" button when one actually exists — many titles have no trailer data, which is normal, not a bug. Its "🔀 Try another" shuffle swaps in a different item from the same `pool` client-side via `/api/tmdb/details` (a small JSON route wrapping `getDetails`) rather than a full page reload. The hero pick itself is randomized among the top 3 candidates on every server render (not always the exact #1), so it doesn't feel static across repeat visits.
- `RatingStars` and `PosterOverlay` support a compact `size="sm"` so you can rate a title (1-5★) directly from any poster grid, not just the detail page — since ratings are now the main signal behind the hero, because-you-liked rows, and tightened recommendations, lowering the friction to rate something matters more than before. A `ratings: Map<string, number>` (from `getRatingMap()`) is threaded through every poster-grid page (Home, Genre/Mood/Region, Search, My Lists, Coming Soon) the same way `statuses` already was, so the compact stars correctly show an existing rating instead of always starting empty.
- App icon is `app/icon.svg` (Next.js auto-detects this convention) — a simple crescent-moon mark in the theme's accent purple, not an emoji. The default create-next-app favicon/boilerplate SVGs in `public/` were removed as dead weight.

## Known open items
- Google sign-in credentials not yet configured (Guest login works fully in the meantime, including separate accounts).
- Not yet deployed — still local-only (`npm run dev`). Deploying will need a hosted Postgres (Neon) swapped in for `DATABASE_URL` and Prisma's schema provider changed from `sqlite` to `postgresql`.
- `AUTH_SECRET` is a placeholder value locally; needs a real random secret before any public deployment.

## Working agreement
- Keep this file updated whenever a notable architectural decision, new feature, or open item changes — not just at major milestones. Small, frequent edits here over letting it drift.
