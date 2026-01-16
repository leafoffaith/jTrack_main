# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JTrack is a spaced repetition system (SRS) application for learning Japanese (Hiragana, Katakana, and Kanji) using the SuperMemo 2 algorithm. Built with React, TypeScript, Vite, and Supabase.

## Current Development Tasks

See [src/todos.md](src/todos.md) for detailed list of current development tasks, including:
- Recent completed tasks: Generic scheduler consolidation, Kanji scheduler, Review heatmap, JMDict reorganization
- Pending tasks: Sentence scheduler implementation
- Backlog: Configurable daily limits in profile

## Development Commands

```bash
# Development
npm run dev              # Start both frontend (5173) and backend server
npm run dev:frontend     # Frontend only
npm run dev:server       # Backend server only

# Build & Preview
npm run build            # Production build (TypeScript + Vite)
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint

# Testing
npm test                 # Run tests with Vitest
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report
```

## Architecture

### Three-Tier Data Flow

```
UI Layer (React Query)
    ↓
Cache Layer (IndexedDB via Dexie)
    - Studied flashcards: 5min TTL
    - Deck metadata: 2min TTL
    ↓
Database Layer (Supabase PostgreSQL)
```

**Key Principle**: Optimistic updates - cache is updated immediately on user actions, then synced to database in the background.

### Directory Structure

- `src/components/` - Feature-based components organized by domain
  - `SuperMemo/` - SRS schedulers (HiraganaScheduler, KatakanaScheduler, KanjiScheduler)
  - `Flashcard/` - Flashcard UI components
  - `Fetching/` - Shared data fetching utilities
  - `Client/` - Supabase client and authentication
  - `ui/` - Reusable UI primitives (57+ components, shadcn/ui style)
- `src/lib/` - Core utilities
  - `CacheManager.ts` - IndexedDB caching logic
  - `db.ts` - Dexie database setup
  - `JMDict.ts` - Sentence flashcard creation utilities
- `src/hooks/` - Custom React hooks
- `src/utils/` - Helper functions
- `src/assets/jmdict/` - Japanese dictionary data
  - `tatoeba.json` - 65,868 example sentences (8MB)
  - `innocent_corpus/` - 31 term metadata JSON files
  - `kanjidic_english/` - 4 kanji dictionary files
  - `Kuroshiro.js` - Japanese text processing library

### Routing Structure

Routes are defined in [src/main.tsx:14-68](src/main.tsx#L14-L68):

```
/ (Home dashboard)
  /learn (Deck selection)
    /learn/hiragana (Study session)
    /learn/hiragana/chart (Reference chart)
    /learn/katakana (Study session)
    /learn/katakana/chart (Reference chart)
    /learn/kanji (In development)
    /learn/sentence (Planned)
  /profile (User stats)
/login (Authentication)
```

## Critical Architectural Patterns

### Spaced Repetition System

- **Algorithm**: SuperMemo 2 implementation in [src/components/SuperMemo/Scheduler.tsx](src/components/SuperMemo/Scheduler.tsx)
- **Deck Schedulers**: HiraganaScheduler, KatakanaScheduler, KanjiScheduler (~80% similar code)
- **Rating System**: 4 levels (Again, Hard, Good, Easy)
- **Daily Limits**: 3 new cards per day, tracked in localStorage with IST timezone
- **Card Priority**: Due cards are shown first, then new cards

### Caching Strategy

**CacheManager** ([src/lib/CacheManager.ts](src/lib/CacheManager.ts)) handles all IndexedDB operations:

- `getStudiedFlashcards()` - Check cache before hitting database
- `updateStudiedFlashcards()` - Bulk cache update after fetch
- `updateSingleFlashcard()` - Optimistic update for single card
- `getDeckMetadata()` / `updateDeckMetadata()` - Cache new/due card counts
- `clearUserCache()` - Clear all cache on logout
- `clearExpiredCache()` - Automatic cleanup (runs every 5 minutes)

**TTL Configuration**:
```typescript
STUDIED_FLASHCARDS: 5 * 60 * 1000  // 5 minutes
DECK_METADATA: 2 * 60 * 1000       // 2 minutes
USER_PROFILE: 30 * 60 * 1000       // 30 minutes
```

### Shared Fetching Utilities

[src/components/Fetching/sharedCardFetch.ts](src/components/Fetching/sharedCardFetch.ts) provides generic, type-safe functions used across all decks:

- `fetchUserStudiedCards()` - Get user's studied cards (cache-first)
- `filterDueCards()` - Filter cards due for review (due_date <= now)
- `filterNewCards()` - Get unstudied cards
- `convertToFlashcardItem()` - Transform deck items to FlashcardItem format

These functions reduce code duplication across deck-specific hooks (useHiraganaFetch, useKatakanaFetch, etc.).

### User ID Mapping

- **Challenge**: Supabase Auth provides UUIDs, but database uses numeric IDs
- **Current Solution**: [src/components/Login/GetUser.tsx](src/components/Login/GetUser.tsx) uses hash-based conversion (UUID → numeric)
- **Caveat**: Hash-based approach has collision risk; consider adding a `numeric_id` column to `users` table for production

## Code Style Guidelines

From [.cursor/rules/jtrack.mdc](.cursor/rules/jtrack.mdc):

**TypeScript:**
- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums; use maps instead
- Use functional components with interfaces

**Code Structure:**
- Use functional and declarative patterns; avoid classes
- Use the `function` keyword for pure functions
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Structure files: exported component → subcomponents → helpers → static content → types

**Naming:**
- Lowercase with dashes for directories (e.g., `components/auth-wizard`)
- Favor named exports for components

**Styling:**
- Use Tailwind for all styling (avoid styled-components, despite it being in dependencies)
- Use curly braces for all conditionals

**Constraints:**
- Do not remove existing code unless necessary
- Do not remove comments or commented-out code unless necessary
- Do not change import or code formatting unless important for new functionality
- Favor simplicity over cleverness

**Performance:**
- Use immutable data structures
- Optimize network requests and data fetching strategies
- Use efficient rendering and state management

## Environment Setup

Required environment variables (`.env` file):

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Database Setup**: See [DEPLOYMENT_PLAN.md](DEPLOYMENT_PLAN.md) for complete Supabase schema (tables: `users`, `studied_flashcards`, `hiragana`, `katakana`, `decks`).

## Testing

- **Framework**: Vitest with jsdom environment
- **Config**: [vite.config.ts:7-11](vite.config.ts#L7-L11)
- **Setup**: [src/test/setup.ts](src/test/setup.ts)
- **Libraries**: React Testing Library, @testing-library/jest-dom
- **Current Coverage**: Limited (4 test files) - room for expansion

## Known Technical Considerations

1. **Debug Logging**: `useKatakanaFetch.ts` and `sharedCardFetch.ts` contain debug logging to `http://127.0.0.1:7242` - should be removed for production
2. **Scheduler Duplication**: HiraganaScheduler, KatakanaScheduler, and KanjiScheduler share ~80% code - potential for consolidation into a generic DeckScheduler
3. **Styling Mix**: Project uses both Tailwind and styled-components - prefer Tailwind per coding guidelines
4. **Hardcoded Settings**: Daily limits (3 cards) and timezone (IST) are hardcoded - no user configuration UI yet
5. **User ID Mapping**: Current hash-based UUID→numeric conversion has collision risk (see "User ID Mapping" section above)
