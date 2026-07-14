# 🎮 GameDB – Game Discovery & Review Platform

## Project Summary

**GameDB** is a full-stack game discovery platform that connects gamers with their next favorite titles. It integrates the RAWG Video Games Database API to provide a rich catalog of games, complete with details, screenshots, trailers, and ratings. Users can browse, search, review, and wishlist games, while writers can submit custom game entries. Administrators have full moderation and analytics capabilities. Built with modern web technologies, it emphasizes user experience, responsive design, and role-based access control.

---

## Architecture Overview

### Tech Stack

#### Frontend

- **Framework:** Next.js 16 (React 19) with App Router
- **Styling:** Tailwind CSS 4 + PostCSS
- **UI Components:** shadcn/ui (Base UI + Radix UI primitives)
- **Authentication:** NextAuth v5 (Credentials Provider with JWT)
- **Forms:** Native React Server Actions
- **Charts:** Chart.js
- **Icons:** Lucide React + React Icons
- **Notifications:** Sonner (Toast library)
- **Carousel:** Swiper
- **Theme:** next-themes (Dark/Light mode support)
- **Animations:** tw-animate-css

#### Backend

- **Runtime:** Node.js (Next.js API routes)
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** NextAuth with Credentials provider, bcrypt password hashing
- **External APIs:** RAWG Video Games Database API, ImageBB (image hosting)
- **Session:** JWT-based sessions (7-day expiry)

#### Deployment

- **Hosting:** Vercel
- **Database:** MongoDB Atlas
- **Image Hosting:** ImageBB
- **Game Data:** RAWG API

---

## Database Schema

### Collections

#### 1. **users**

- User profiles (readers/gamers and administrators)
- Managed by NextAuth + custom schema
- Fields: `name`, `email` (unique), `password` (hashed, excluded by default), `role` (user/admin), `isBanned`, `image`, timestamps

#### 2. **reviews**

- User-written game reviews
- Fields: `gameId` (indexed), `gameName`, `gameImage`, `user` (ObjectId → User), `userName`, `rating` (1–5), `comment` (max 1000), `status` (approved/pending/rejected), timestamps
- Compound unique index: one review per user per game

#### 3. **favorites**

- User wishlist/bookmark entries
- Fields: `gameId`, `gameName`, `gameImage`, `gameRating`, `user` (ObjectId → User), created date
- Compound unique index: one favorite per user per game

#### 4. **customgames**

- User-submitted custom game entries
- Fields: `title`, `shortDescription`, `fullDescription`, `releaseDate`, `genre`, `developer`, `publisher`, `platforms`, `screenshots`, `tags`, `imageUrl`, `submittedBy` (ObjectId → User), `status` (published/draft/pending/archived), timestamps

---

## Project Structure

```
gamedb/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Home page (hero + popular/new/upcoming/top sections)
│   ├── not-found.tsx                 # Custom 404 page
│   ├── layout.tsx                    # Root layout (Navbar, Footer, providers)
│   ├── globals.css                   # Global styles + Tailwind v4 theme
│   │
│   ├── api/                          # API route handlers (31 routes)
│   │   ├── auth/[...nextauth]/       # NextAuth endpoints
│   │   ├── register/                 # User registration
│   │   ├── games/                    # RAWG game data + reviews
│   │   ├── hero-games/               # Featured hero slider games
│   │   ├── user/                     # User-scoped endpoints
│   │   │   ├── profile/              # Profile CRUD
│   │   │   ├── favorites/            # Wishlist CRUD
│   │   │   ├── reviews/              # User reviews
│   │   │   ├── custom-games/         # User custom games
│   │   │   ├── stats/                # User dashboard stats
│   │   │   ├── charts/               # User chart data
│   │   │   └── activity/             # User activity feed
│   │   └── admin/                    # Admin-scoped endpoints
│   │       ├── users/                # User management
│   │       ├── games/                # Game activity overview
│   │       ├── reviews/              # Review moderation
│   │       ├── custom-games/         # Custom game moderation
│   │       ├── stats/                # Platform-wide stats
│   │       ├── charts/               # Platform chart data
│   │       └── activity/             # Platform activity feed
│   │
│   ├── explore/                      # Game catalog with search & filters
│   ├── games/[id]/                   # Game detail page
│   ├── games/custom/[id]/            # Custom game detail page
│   ├── genres/                       # Genre listing
│   ├── platforms/                    # Platform listing
│   ├── news/                         # Recent releases as news articles
│   ├── about/                        # About page
│   ├── community/                    # Community custom games listing
│   ├── contact/                      # Contact form
│   ├── login/                        # Authentication
│   ├── register/                     # User registration
│   ├── items/add/                    # Custom game submission form
│   ├── items/manage/                 # Manage user's custom games
│   ├── user/dashboard/               # User dashboard
│   │   ├── profile/                  # Profile settings
│   │   ├── settings/                 # Appearance/preferences
│   │   ├── account/                  # Account management
│   │   ├── favorites/                # Wishlist management
│   │   ├── reviews/                  # Review management
│   │   ├── custom-games/             # Custom game management
│   │   ├── activity/                 # User activity log
│   │   ├── notifications/            # Notifications
│   │   └── [id]/                     # Public user profile
│   └── admin/dashboard/              # Admin dashboard
│       ├── users/                    # User management
│       ├── reviews/                  # Review moderation
│       ├── custom-games/             # Custom game moderation
│       ├── games/                    # Game activity
│       ├── activity/                 # Platform activity
│       ├── roles/                    # Roles & permissions
│       └── status/                   # System status
│
├── components/
│   ├── ui/                           # Reusable UI primitives (11 components)
│   │   ├── button.tsx, card.tsx, input.tsx, badge.tsx
│   │   ├── skeleton.tsx, avatar.tsx, separator.tsx
│   │   ├── dropdown-menu.tsx, sheet.tsx, label.tsx, sonner.tsx
│   ├── layout/                       # Layout components (8)
│   │   ├── Navbar.tsx, Footer.tsx, SearchBar.tsx
│   │   ├── ThemeToggle.tsx, ThemeProvider.tsx
│   │   ├── MobileNav.tsx, NavLink.tsx, UserMenu.tsx
│   ├── auth/                         # Authentication components (2)
│   │   ├── LoginForm.tsx, RegisterForm.tsx
│   ├── games/                        # Game-related components (16)
│   │   ├── GameCard.tsx, GameRow.tsx, GameCardSkeleton.tsx
│   │   ├── PopularGames.tsx, TopRatedGames.tsx
│   │   ├── UpcomingGames.tsx, NewReleases.tsx
│   │   ├── GenreGrid.tsx, PlatformIcons.tsx
│   │   ├── ReviewSection.tsx, WishlistButton.tsx
│   │   ├── ScreenshotGallery.tsx
│   │   ├── CustomGameRow.tsx, CustomGamesClient.tsx
│   │   └── CustomGameEditButton.tsx
│   ├── explore/                      # Explore page components (3)
│   │   ├── ExploreToolbar.tsx, ExploreFilters.tsx, ExplorePagination.tsx
│   ├── dashboard/                    # User dashboard components (11)
│   │   ├── DashboardContent.tsx, AccountOverview.tsx
│   │   ├── UserProfileForm.tsx, SettingsForm.tsx
│   │   ├── UserFavoritesTable.tsx, UserReviewsTable.tsx
│   │   ├── UserCustomGamesTable.tsx, CustomGameForm.tsx
│   │   ├── AddCustomGameModal.tsx, EditCustomGameModal.tsx
│   │   └── NotificationsList.tsx
│   ├── admin/                        # Admin components (6)
│   │   ├── AdminDashboard.tsx, AdminUsersTable.tsx
│   │   ├── AdminReviewsTable.tsx, AdminCustomGamesTable.tsx
│   │   └── AdminGamesTable.tsx, GameImage.tsx
│   ├── slider/                       # Hero slider
│   │   └── HeroSlider.tsx
│   └── providers/                    # Context providers
│       └── SessionProvider.tsx
│
├── lib/
│   ├── rawg.ts                       # RAWG API client (8 functions)
│   ├── mongodb.ts                    # MongoDB cached connection
│   ├── utils.ts                      # cn() classname utility
│   ├── imagebb.ts                    # ImageBB upload helper
│   ├── platform-icons.tsx            # Platform icon mapper
│   └── genre-icons.tsx               # Genre icon mapper
│
├── models/                           # Mongoose schemas (4)
│   ├── User.ts, Review.ts, Favorite.ts, CustomGame.ts
│
├── types/                            # TypeScript type augmentation
│   └── next-auth.d.ts
│
├── proxy.ts                          # NextAuth middleware (route protection)
├── auth.config.ts                    # Auth configuration
├── auth.ts                           # NextAuth initialization
├── next.config.mjs                   # Next.js configuration
├── postcss.config.mjs                # PostCSS configuration
└── package.json
```

---

## Data Flow

### Game Discovery Flow

```
Home Page
  → Hero Slider (featured games from RAWG)
  → Popular / New / Upcoming / Top Rated sections
  → Click Game Card
  → Game Detail Page (cover, screenshots, trailers, description, details)
  → Browse Reviews → Submit Review
  → Add to Wishlist
```

### Review Submission Flow

```
Game Detail Page
  → Review Section
  → Select Rating (1–5 Stars)
  → Write Comment
  → Submit Review (auto-approved for public games)
  → Review appears in game detail & user dashboard
  → Admin can moderate (approve/pending/reject)
```

### Custom Game Publishing Flow

```
User Dashboard → Custom Games
  → Add New Custom Game
  → Fill Form (Title, Description, Genre, Platforms, Screenshots, Tags)
  → Submit (status: pending)
  → Admin Review → Published / Draft / Archived
  → Appears in Custom Game Catalog (if published)
```

### Authentication & Authorization Flow

```
Login / Register
  → NextAuth Credentials Provider
  → Password hashing (bcrypt)
  → JWT Session (7-day expiry)
  → Role-based route protection (User / Admin)
  → Ban detection on every request
  → Dashboard Access (user or admin based on role)
```

---

## API Endpoints

### Public Endpoints

| Method | Route                     | Description                           |
| ------ | ------------------------- | ------------------------------------- |
| GET    | `/api/games`              | Fetch games from RAWG                 |
| GET    | `/api/games/[id]/reviews` | Paginated approved reviews for a game |
| GET    | `/api/hero-games`         | Featured games for hero slider        |
| POST   | `/api/register`           | Create new user account               |

### Authenticated User Endpoints

| Method           | Route                         | Description                                            |
| ---------------- | ----------------------------- | ------------------------------------------------------ |
| GET/POST/DELETE  | `/api/user/favorites`         | Wishlist CRUD                                          |
| GET              | `/api/user/reviews`           | List user's reviews (paginated, filterable)            |
| GET/POST         | `/api/user/custom-games`      | Custom game listing & creation                         |
| PATCH            | `/api/user/custom-games/[id]` | Update custom game                                     |
| GET/PATCH/DELETE | `/api/user/profile`           | Profile management (read, update, delete)              |
| GET              | `/api/user/stats`             | User dashboard statistics                              |
| GET              | `/api/user/charts`            | User chart data (reviews, ratings, wishlist over time) |
| GET              | `/api/user/activity`          | Recent user activity feed                              |

### Admin Endpoints

| Method           | Route                          | Description                                           |
| ---------------- | ------------------------------ | ----------------------------------------------------- |
| GET              | `/api/admin/stats`             | Platform-wide statistics                              |
| GET/PATCH/DELETE | `/api/admin/users/[id]`        | User management (ban/unban/delete)                    |
| GET              | `/api/admin/games`             | Game activity overview                                |
| GET/PATCH/DELETE | `/api/admin/reviews/[id]`      | Review moderation (approve/reject/delete)             |
| GET/PATCH/DELETE | `/api/admin/custom-games/[id]` | Custom game moderation (publish/draft/archive/delete) |
| GET              | `/api/admin/charts`            | Platform chart data                                   |
| GET              | `/api/admin/activity`          | Platform activity feed                                |

### Auth Endpoints

| Method   | Route                     | Description                                |
| -------- | ------------------------- | ------------------------------------------ |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers (login, logout, session) |

---

## Security Considerations

1. **Authentication:** NextAuth v5 with JWT session tokens (7-day expiration) and bcrypt password hashing
2. **Protected Routes:** Middleware-based route protection with role-based access control (User/Admin)
3. **Ban System:** Banned users are detected in auth middleware and restricted to public pages
4. **Database Security:** MongoDB Atlas with environment-variable-secured credentials
5. **Password Protection:** Password field excluded from default queries via Mongoose `select: false`
6. **Input Validation:** Mongoose schema validation, max-length constraints on text fields
7. **Session Persistence:** JWT tokens survive page reloads; no data loss
8. **Environment Management:** All API keys and secrets stored in `.env.local` (gitignored)
9. **Image Handling:** External image domains whitelisted in Next.js config; ImageBB for user uploads
10. **Rate Limiting:** RAWG API responses cached with 1-hour ISR revalidation

---

## User Roles & Permissions

<<<<<<< HEAD
| Feature | Visitor | User | Admin |
| :------ | :-----: | :-: | :---: |
| Browse Game Catalog | ✅ | ✅ | ✅ |
| View Game Details | ✅ | ✅ | ✅ |
| Search & Filter Games | ✅ | ✅ | ✅ |
| Submit Reviews | ❌ | ✅ | ✅ |
| Manage Own Reviews | ❌ | ✅ | ✅ |
| Add to Wishlist | ❌ | ✅ | ✅ |
| Manage Own Wishlist | ❌ | ✅ | ✅ |
| Submit Custom Games | ❌ | ✅ | ✅ |
| Manage Own Custom Games | ❌ | ✅ | ✅ |
| View Own Dashboard & Analytics | ❌ | ✅ | ✅ |
| Moderate All Reviews | ❌ | ❌ | ✅ |
| Moderate All Custom Games | ❌ | ❌ | ✅ |
| Manage All Users (Ban/Delete) | ❌ | ❌ | ✅ |
| View Platform Analytics | ❌ | ❌ | ✅ |
| View Platform Activity Feed | ❌ | ❌ | ✅ |
| System Status Monitoring | ❌ | ❌ | ✅ |
| Delete Own Account | ❌ | ✅ | ❌ |
=======
| Feature                        | Visitor | User | Admin |
| :----------------------------- | :-----: | :--: | :---: |
| Browse Game Catalog            |   ✅    |  ✅  |  ✅   |
| View Game Details              |   ✅    |  ✅  |  ✅   |
| Search & Filter Games          |   ✅    |  ✅  |  ✅   |
| Submit Reviews                 |   ❌    |  ✅  |  ✅   |
| Manage Own Reviews             |   ❌    |  ✅  |  ✅   |
| Add to Wishlist                |   ❌    |  ✅  |  ✅   |
| Manage Own Wishlist            |   ❌    |  ✅  |  ✅   |
| Submit Custom Games            |   ❌    |  ✅  |  ✅   |
| Manage Own Custom Games        |   ❌    |  ✅  |  ✅   |
| View Own Dashboard & Analytics |   ❌    |  ✅  |  ✅   |
| Moderate All Reviews           |   ❌    |  ❌  |  ✅   |
| Moderate All Custom Games      |   ❌    |  ❌  |  ✅   |
| Manage All Users (Ban/Delete)  |   ❌    |  ❌  |  ✅   |
| View Platform Analytics        |   ❌    |  ❌  |  ✅   |
| View Platform Activity Feed    |   ❌    |  ❌  |  ✅   |
| System Status Monitoring       |   ❌    |  ❌  |  ✅   |
| Delete Own Account             |   ❌    |  ✅  |  ❌   |
>>>>>>> 0cedaf2 (Added user profile management with image upload and display.)

---

## Performance & Scalability

- **Pagination:** Server-side pagination on reviews, favorites, and custom games for efficient data loading
- **Skeleton Loaders:** Loading states on all pages for improved perceived performance
- **Image Optimization:** Next.js Image component with remote pattern configuration for RAWG CDN
- **Caching Strategy:** RAWG API responses cached with ISR (1-hour revalidation) to stay under rate limits
- **Code Splitting:** App Router enables automatic route-based code splitting
- **Database Indexing:** Compound indexes on frequently queried fields (gameId + user)
- **CDN Delivery:** Vercel's edge network for global static asset delivery
- **Responsive Design:** Mobile-first, works across all device sizes
- **Dark Mode:** Built-in theme switching with next-themes

---

## Future Enhancement Opportunities

- **User Reviews & Ratings:** Implement a rating system with user feedback on helpfulness
- **Advanced Search:** Full-text search with Elasticsearch or MongoDB Atlas Search
- **Social Features:** User following system, game recommendations, activity feeds
- **Gaming Communities:** Forums, discussion boards, and community events per game
- **Game Lists:** Curated lists (e.g., "Best RPGs of 2024") and user-created collections
- **Achievements & Badges:** Gamification elements to encourage platform participation
- **Comparison Tools:** Side-by-side game comparisons, price tracking
- **Mobile App:** Native iOS/Android apps for on-the-go game discovery
- **API Rate Limiting:** Implement rate limiting on user-facing API routes
- **Email Notifications:** Review responses, wishlist price changes, new game alerts
- **OAuth Providers:** Add Google, GitHub, or Discord authentication options
- **Multi-language Support:** Internationalization for a global audience
