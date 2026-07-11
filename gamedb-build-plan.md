# GameDB — Build Plan & Status

A game discovery, review, and favorites platform built on the RAWG API. This
document tracks the actual architecture and current build status against the
assignment requirements — not a generic template, this reflects what has
really been built so far.

---

## 1. Tech Stack (as implemented)

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), no `src/` directory |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | lucide-react (UI icons) + react-icons (platform brand logos) |
| Charts | Recharts (planned — admin dashboard, not yet built) |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth v5 (Credentials provider, JWT session strategy) |
| Game data | RAWG API (`lib/rawg.ts` — single wrapper, all requests go through it) |
| Route protection | `proxy.ts` (Next.js 16 middleware convention) + `auth.config.ts` |

**3 primary colors:** deep navy/black background (neutral), neon lime-green
primary/accent, white foreground text. Defined in `app/globals.css` as
`:root` / `.dark` OKLCH variables.

---

## 2. Domain Model

**`User`** — name, email, password (hashed), role (`user`/`admin`), isBanned

**`Review`** — gameId (RAWG id), gameName, gameImage, user (ref), userName,
rating (1–5), comment. Unique index on `(gameId, user)` — one review per
user per game.

**`Favorite`** — gameId, gameName, gameImage, gameRating, user (ref). Unique
index on `(gameId, user)`.

**`CustomGame`** — title, shortDescription, fullDescription, releaseDate,
genre, imageUrl, submittedBy (ref). This is what powers `/items/add` and
`/items/manage` — since the core catalog comes from RAWG (a public API),
these are user-submitted "community added" games layered on top, which is
what satisfies the assignment's Add/Manage Items requirement without
duplicating RAWG's own data into MongoDB.

Game *listings themselves* (the cards everywhere) are **not** stored in
MongoDB — they're fetched live from RAWG via `lib/rawg.ts` with `next: {
revalidate: 3600 }` caching.

---

## 3. Repository Structure (actual)

```
gamedb/
├── app/
│   ├── layout.tsx                 # SessionProvider, Navbar, Toaster
│   ├── page.tsx                   # Home: HeroSlider, PopularGames, GenreGrid, ...
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── explore/page.tsx           # search/filter/sort/pagination
│   ├── genres/page.tsx
│   ├── platforms/page.tsx
│   ├── news/page.tsx              # RAWG recent releases, presented as news
│   ├── games/[id]/page.tsx        # ⬜ NOT BUILT YET
│   ├── items/
│   │   ├── add/page.tsx           # ⬜ NOT BUILT YET
│   │   └── manage/page.tsx        # ⬜ NOT BUILT YET
│   ├── admin/page.tsx             # ⬜ NOT BUILT YET
│   ├── about/page.tsx             # ⬜ NOT BUILT YET
│   ├── contact/page.tsx           # ⬜ NOT BUILT YET
│   ├── wishlist/page.tsx          # ⬜ NOT BUILT YET (favorites list)
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── register/route.ts
│       ├── hero-games/route.ts
│       └── games/route.ts
├── components/
│   ├── layout/                    # Navbar, MobileNav, UserMenu, NavLink, ThemeToggle
│   ├── auth/                      # LoginForm, RegisterForm
│   ├── games/                     # GameCard, GameCardSkeleton, GameRow, PlatformIcons,
│   │                              # PopularGames, GenreGrid, HeroSlider
│   ├── explore/                   # ExploreFilters, ExplorePagination
│   └── providers/                 # SessionProvider
├── lib/
│   ├── mongodb.ts
│   ├── rawg.ts                    # all RAWG calls go through here
│   ├── platform-icons.tsx
│   └── genre-icons.tsx
├── models/                        # User, Review, Favorite, CustomGame
├── types/next-auth.d.ts
├── auth.ts / auth.config.ts
├── proxy.ts                        # route protection (Next 16 middleware)
└── scripts/seed-demo.mjs           # gitignored, seeds demo+admin accounts
```

---

## 4. Requirement Checklist — Current Status

### Done ✅
- Tech stack (Next.js + TS + Tailwind + MongoDB + JWT via NextAuth)
- Navbar: sticky, responsive, 4 routes logged-out, 5+ via UserMenu dropdown logged-in
- Hero section (HeroSlider — Swiper carousel, RAWG top-rated games with
  ratings-count threshold + dedupe logic, CTA buttons)
- Homepage sections: 5 sections — HeroSlider, PopularGames (GameRow), GenreGrid,
  UpcomingGames, TopRatedGames
- Footer (built, contains working nav + social links)
- Card section: consistent size/radius, 4/row desktop, skeleton loader
  (`GameCardSkeleton`)
- Explore page: genre + platform filters, 6 sort options, pagination,
  4-per-row grid
- Genres page, Platforms page (browse-all versions of the homepage grids)
- News page (RAWG recent releases presented as a news list — real data,
  not fabricated articles)
- Auth: register, login, demo-login button, bcrypt hashing, role field on
  User model, route protection via `proxy.ts`
- **Game Details page** (`/games/[id]`) — fetches from RAWG via
  `getGameById` + `getGameScreenshots`; breadcrumb, cover, info panel,
  screenshot gallery, rating breakdown bar chart, about/specs sidebar,
  similar games by genre

### Not yet built ⬜
- **Reviews/Ratings UI** — model exists, no form/list component yet
- **Favorites/Wishlist UI** — model exists, no add-button or list page yet
- **`/items/add`** — protected form for CustomGame submission
- **`/items/manage`** — table/grid of the user's own CustomGame entries,
  with View/Delete actions
- **Admin panel** (`/admin`) — user list, ban/delete actions; `role`/
  `isBanned` fields already exist on the User model, UI is missing
- **About, Contact pages** (2 additional pages required — News/Genres/
  Platforms may already satisfy this, but About/Contact are the more
  conventional choice and safer for the rubric)
- **Upcoming / New Releases section on homepage** — `getUpcomingGames()`
  exists in `lib/rawg.ts` but is not connected to any component
- **Homepage only has 4 sections** (HeroSlider, PopularGames, GenreGrid,
  TopRatedGames) — plan targets 7 total. Consider adding Upcoming, New
  Releases, and another row (e.g. most anticipated)
- **Footer dead links** — all footer "Discover/Community/Support" links
  use `href="#"` and lead nowhere
- **Navbar search input** — visual-only, no form submission or router push
- **Social login** (optional, skip unless time remains)
- **Recharts chart** on admin page (optional nice-to-have, not required
  by the rubric text directly but pairs well with admin stats)

---

## 5. Remaining Build Order

1. ✅ **Game Details page** (`/games/[id]`)
   - Fetch via `getGameById` + `getGameScreenshots` from `lib/rawg.ts`
   - Sections: breadcrumb nav, cover image, info panel, screenshot gallery,
     rating breakdown bar chart, about/specs sidebar, similar games by genre
   - This unblocks every existing "View Details" link across the app

2. **Reviews system**
   - `components/reviews/ReviewForm.tsx` (logged-in only, 1–5 stars +
     comment, POST to `/api/reviews`)
   - `components/reviews/ReviewList.tsx` (renders on Details page)
   - `app/api/reviews/route.ts` (GET by gameId, POST create)

3. **Favorites/Wishlist**
   - Add-to-favorite button on GameCard + Details page
   - `app/api/favorites/route.ts` (GET mine, POST, DELETE)
   - `app/wishlist/page.tsx` (protected, lists the user's favorites)

4. **`/items/add`** — CustomGame submission form (title, short/full
   description, release date, genre, optional image URL)

5. **`/items/manage`** — table/grid of the user's own CustomGame entries,
   View/Delete actions

6. **Admin panel** (`/admin`)
   - User list table, ban toggle, delete
   - `app/api/admin/users/route.ts` (GET all), `[id]/route.ts` (PATCH ban,
     DELETE)
   - Protected via existing `role === "admin"` check in `auth.config.ts`

7. **Upcoming / New Releases section** on homepage (use existing
   `getUpcomingGames()` from `lib/rawg.ts`)

8. **About / Contact pages**

9. **Footer dead link fix + Navbar search wiring**

10. **QA pass** — every nav/footer link resolves, no dead `href="#"`,
    responsive check at mobile/tablet/desktop, skeletons visible under
    throttled network

11. **Deploy** — Vercel + MongoDB Atlas, set env vars
    (`MONGODB_URI`, `AUTH_SECRET`, `RAWG_API_KEY`)

12. **README** — setup steps, demo credentials, architecture note

---

## 6. Environment Variables

```
MONGODB_URI=
AUTH_SECRET=
RAWG_API_KEY=
```

---

## 7. Demo Credentials (seeded via `scripts/seed-demo.mjs`, gitignored)

- **User:** demo@gamedb.com / demo1234
- **Admin:** admin@gamedb.com / admin1234

Keep these in the README for submission — the seed script itself is not
committed to the repo.

---

## 8. Final Submission Checklist

- [ ] Live URL (Vercel)
- [ ] GitHub repo link
- [ ] Demo credentials in README (user + admin)
- [ ] All nav/footer links functional, no 404s
- [x] Details page live for every game card
- [ ] Reviews + Favorites working end to end
- [ ] `/items/add` and `/items/manage` protected + functional
- [ ] Admin can ban/delete users
- [ ] Homepage has 7 sections (currently 4)
- [ ] Footer links resolve (currently all `#`)
- [ ] Navbar search functional
- [ ] Mobile/tablet/desktop responsive check done
- [ ] No lorem ipsum / placeholder content anywhere
- [ ] Skeleton loaders visible on slow network
- [ ] Auth redirect tested on protected routes while logged out
