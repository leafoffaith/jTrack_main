# JTrack AI Coding Guidelines

## Architecture Overview

JTrack is a React SPA for Japanese SRS learning using SuperMemo2 algorithm. Frontend (Vite + TS) connects to Supabase for data, with local Express server for Kuroshiro romanization. Client-side caching via Dexie IndexedDB.

## Key Patterns

- **SRS Logic**: Use `supermemo()` from `SuperMemoAlgo.ts` for interval calculations. See `HiraganaScheduler.tsx` for implementation.
- **Data Fetching**: Leverage `sharedCardFetch.ts` for studied/new/due cards. Cache via `CacheManager` (5min TTL for studied cards).
- **Auth Flow**: Supabase auth with numeric user ID mapping (`userIdHelper.ts`). Clear cache on logout.
- **Component Structure**: Functional components with TS interfaces. Export from `index.tsx` in each feature dir.
- **Styling**: Tailwind + Radix UI. Colors from `constants/colors.ts`.

## Development Workflow

- **Run App**: `npm run dev` (concurrent frontend + server on :5173/:3001)
- **Test**: `npm test` (Vitest + RTL). Mock Supabase in `src/test/__mocks__/`
- **Build**: `npm run build` (TS + Vite). Preview with `npm run preview`
- **Lint**: `npm run lint` (ESLint, no unused vars)

## Code Conventions

- Interfaces over types. Functional components. Descriptive names (e.g., `isLoading`, `hasError`).
- Curly braces for all conditionals. Declarative JSX.
- Import formatting: Keep existing order/grouping.
- Error handling: Console.warn for non-critical, console.error for failures.

## Database Schema

- `studied_flashcards`: Tracks SRS state (interval, efactor, due_date)
- `hiragana/katakana/kanji`: Static deck data
- User tables: `users`, `user_study_sessions`

## Common Tasks

- **Add New Deck**: Create scheduler in `SuperMemo/`, fetch logic in `Fetching/`, route in `main.tsx`
- **Update SRS**: Modify `supermemo()` function, test with `SuperMemoTest.tsx`
- **Cache Changes**: Update `CacheManager` methods, ensure TTL consistency

Reference: `README.md` for setup, `DEPLOYMENT_PLAN.md` for schema, `.cursor/rules/jtrack.mdc` for style.
