# JTrack Development Todos

## Completed Tasks ✅

### 1. Fix Frontend Loading Issue ✅
**Status**: COMPLETED

**Problem**: Frontend was showing blank page - RouterProvider wasn't wrapped in App component, so it didn't have access to QueryClientProvider context.

**Files Changed**:
- `src/main.tsx:70-75` - Wrapped RouterProvider inside App component

---

### 2. Consolidate Scheduler Logic into Generic Component ✅
**Status**: COMPLETED
**Priority**: HIGH (makes tasks 3 & 4 much easier)

**Goal**: HiraganaScheduler and KatakanaScheduler share ~99% identical code (348 and 351 lines respectively). Create a reusable GenericScheduler component.

**Completed Steps**:

**Step 1: Create Type Definitions** ✅
- [x] Created `src/components/SuperMemo/types.ts` with DeckConfig, DeckFetchFunctions, GenericSchedulerProps, UpdatedFlashcard, StudiedFlashcardData interfaces

**Step 2: Create Deck Configurations** ✅
- [x] Created `src/components/SuperMemo/configs/deckConfigs.ts` with HIRAGANA_CONFIG and KATAKANA_CONFIG
  - [x] HIRAGANA_CONFIG - uses fetchAvailableHiragana, HiraganaCard
  - [x] KATAKANA_CONFIG - uses fetchAvailableKatakana, KatakanaCard, dailyDueCards limit

**Step 3: Create Generic Scheduler Component** ✅
- [x] Created `src/components/SuperMemo/GenericScheduler.tsx`
  - [x] Copied logic from HiraganaScheduler.tsx as starting point
  - [x] Replaced hardcoded 'hiragana' with `config.deckType`
  - [x] Replaced fetch function calls with `config.fetchFunctions.fetchAvailable()` etc.
  - [x] Replaced `<HiraganaCard>` with `<config.CardComponent>`
  - [x] Replaced mode labels with `config.modeLabel[mode]`
  - [x] Added cache update after DB upsert
  - [x] Used `config.limits?.dailyDueCards` for due card limiting

**Step 4: Refactor Existing Schedulers** ✅
- [x] Updated `src/components/SuperMemo/HiraganaScheduler.tsx` to wrapper component
  - [x] Imported GenericScheduler and HIRAGANA_CONFIG
  - [x] Replaced entire implementation with simple wrapper: `<GenericScheduler config={HIRAGANA_CONFIG} />`
- [x] Updated `src/components/SuperMemo/KatakanaScheduler.tsx` to wrapper component
  - [x] Imported GenericScheduler and KATAKANA_CONFIG
  - [x] Replaced entire implementation with simple wrapper: `<GenericScheduler config={KATAKANA_CONFIG} />`

**Step 5: Update sessionHelper for Generic Deck Types** ✅
- [x] Updated `src/components/Client/sessionHelper.ts`
  - [x] Changed `getNewCardsShownToday` parameter from `'hiragana' | 'katakana'` to `string`
  - [x] Changed `markNewCardShown` parameter from `'hiragana' | 'katakana'` to `string`

**Step 6: Remove Debug Logging** ✅
- [x] Removed debug logging from `src/components/Fetching/useKatakanaFetch.ts`
- [x] Removed debug logging from `src/components/Fetching/sharedCardFetch.ts`

**Step 7: Code Quality** ✅
- [x] Fixed TypeScript errors:
  - [x] Removed unused `supaClient` import from `userIdHelper.ts`
  - [x] Removed unused `fetchNewCards` import from `useKatakanaFetch.ts`
  - [x] Removed unused `SuperMemoGrade` import from `types.ts`
  - [x] Implemented stub functions in `kanjiParser.ts`
- [x] Verified TypeScript compiles without errors (`npx tsc --noEmit` passes)

**Step 8: Manual Testing** (Recommended)
- [ ] Run `npm run dev` and test Hiragana scheduler
- [ ] Test Katakana scheduler - verify 3 due card limit works
- [ ] Verify cache updates in DevTools → IndexedDB
- [ ] Check both schedulers behave identically (except deck content)
- [ ] Test mode switching (new/due/all) via URL parameters

**Impact**: Reduced code duplication from ~700 lines (2 schedulers × 350 lines) to ~330 lines (1 generic + 2 wrappers). Makes adding new deck types much simpler - just need config + fetch functions!

---

### 3. Create Kanji Scheduler ✅
**Status**: COMPLETED
**Completed**: 2026-01-15

**Goal**: Implement functional Kanji study mode using the scheduler system.

**Completed Steps**:
- [x] Updated `src/components/Fetching/useKanjiFetch.ts`:
  - [x] Added `fetchAvailableKanjiCards()`, `fetchDueKanjiCards()`, `fetchNewKanjiCards()` wrapper functions
  - [x] Added level query parameter support (`?level=N5`)
  - [x] Updated `fetchKanjiList()` to filter by JLPT level
- [x] Created `KANJI_CONFIG` in `src/components/SuperMemo/configs/deckConfigs.ts`:
  - [x] Added KanjiCardFront component for front side display
  - [x] Configured fetch functions and deck settings
- [x] Updated `src/components/SuperMemo/GenericScheduler.tsx`:
  - [x] Added kanjiBack prop support for Flashcard component
- [x] Updated `src/components/SuperMemo/KanjiScheduler.tsx`:
  - [x] Replaced "Under Construction" stub with GenericScheduler
  - [x] Now uses KANJI_CONFIG (same pattern as Hiragana/Katakana)
- [x] Updated `src/components/Kanji/Kanji.tsx`:
  - [x] Changed navigation from `/learn/kanji/${level}` to `/learn/kanji?level=${level}`
  - [x] Supports N5, N4, N3 level selection
- [x] Fixed all TypeScript errors

**Features Implemented**:
- Front side: Displays kanji character only
- Back side: Shows kanji with meanings, readings (on/kun), examples (via KanjiCard component)
- Uses existing kanjiBack data structure from Flashcard component
- 3 new cards per day limit
- Unlimited due cards
- JLPT level filtering (N5/N4/N3) via query parameter
- Full SRS algorithm integration (SuperMemo 2)
- Cache integration via CacheManager

**Testing Needed**:
- [ ] Verify Supabase `kanji` table has data with `jlpt_level` column
- [ ] Test N5 level kanji study session
- [ ] Test N4 level kanji study session
- [ ] Test N3 level kanji study session
- [ ] Verify cache updates correctly
- [ ] Verify daily limit enforcement
- [ ] Test due card prioritization

**Note**: Kanji table must have columns: `kanji`, `meanings`, `kun_readings`, `on_readings`, `name_readings`, `stroke_count`, `jlpt_level`. If table doesn't exist or lacks data, you'll need to import from `src/components/JMDict/kanjidic_english/kanji_bank_*.json`.

---

## Pending Tasks

### 4. Create Sentence Learning Deck
**Status**: TODO (partially implemented - has stub)
**Depends On**: Task 2 (optional but recommended)

**Goal**: Implement sentence study mode for contextual learning.

**Current State**:
- `src/components/SuperMemo/SentenceScheduler.tsx` - Currently shows "Under Construction" message
- `src/components/Fetching/useSentenceFetch.ts` - Basic fetch logic exists
- Routing already exists in `src/main.tsx:52-55`

**Files to Update**:
- [ ] `src/components/SuperMemo/SentenceScheduler.tsx` - Implement full scheduler (use GenericScheduler if available)
- [ ] `src/components/Flashcard/Flashcard.tsx` - Add SentenceCard component if not exists
- [ ] `src/components/Fetching/useSentenceFetch.ts` - Verify and adapt to match shared pattern

**Database Considerations**:
- May need to create/verify `sentence` table in Supabase
- Consider using JMDict tatoeba.json data (see task 5)
- Sentence cards might have multiple-choice options

---

### 5. Move JMDict Assets to Proper Location
**Status**: TODO
**Priority**: MEDIUM

**Goal**: Move JMDict dictionary assets from components folder to assets folder (components should only contain React components, not data files).

**Current Location**: `src/components/JMDict/`
**Target Location**: `src/assets/jmdict/`

**Files to Move**:
- [ ] `src/components/JMDict/innocent_corpus/` (29 term_meta_bank JSON files)
- [ ] `src/components/JMDict/kanjidic_english/` (2 kanji_bank + 1 tag_bank JSON files)
- [ ] `src/components/JMDict/tatoeba.json` - Sentence examples
- [ ] `src/components/JMDict/Kuroshiro.js` - Japanese text processing library

**Files to Keep in Components** (code, not data):
- `src/components/JMDict/JMDict.ts` - Keep in components or move to `src/lib/`

**Files to Update After Move**:
- [ ] Any imports referencing the old JMDict path
- [ ] `src/components/JMDict/JMDict.ts` - Update import paths

**Post-Move Cleanup**:
- [ ] Delete empty `src/components/JMDict/` directory structure
- [ ] Verify all imports still work
- [ ] Test sentence deck integration (if using tatoeba.json)

---

## Additional Notes

### Code Style Reminders
- Use TypeScript for all code
- Prefer functional components with interfaces
- Use Tailwind CSS for styling
- Follow existing patterns in HiraganaScheduler/KatakanaScheduler
- Maintain optimistic cache updates via CacheManager

### Testing Checklist (for each task)
- [ ] Frontend loads without errors
- [ ] Study session works (flip cards, rate them)
- [ ] SuperMemo algorithm calculates correctly
- [ ] Cache updates properly (check IndexedDB)
- [ ] Daily limits respected (3 new cards)
- [ ] Due cards shown before new cards
- [ ] Navigation works (back to decks, etc.)

### Known Issues to Address
1. Debug logging to `http://127.0.0.1:7242` in sharedCardFetch.ts - should be removed for production
2. Hash-based UUID→numeric user ID conversion has collision risk - consider dedicated column
3. Hardcoded daily limits (3 cards) and timezone (IST) - no user config UI

---

### 6. Review Heatmap on Home Screen ✅
**Status**: COMPLETED
**Completed**: 2026-01-15

**Goal**: Add a visual heatmap on the home screen showing future review forecasts with color coding.

**Completed Steps**:
- [x] Created `src/hooks/useReviewForecast.ts`:
  - [x] Fetches next 14 days of due dates from studied_flashcards
  - [x] Aggregates counts per day
  - [x] Returns forecast data with max count for scaling
- [x] Created `src/components/ReviewHeatmap/ReviewHeatmap.tsx`:
  - [x] Displays 14-day forecast in 2 rows of 7 days
  - [x] Color coding: Yellow (light), Orange (medium), Red (heavy)
  - [x] Hover tooltips with exact counts and intensity
  - [x] "Today" indicator badge
  - [x] Legend showing intensity levels
- [x] Integrated heatmap into `src/components/Home/Home.tsx`:
  - [x] Replaced "Reviews Forecast" text with heatmap
  - [x] Shows loading state while fetching
  - [x] Fallback message if no reviews

**Features**:
- **14-day forecast** showing future review load
- **Color scheme**: Yellow (1-10), Orange (11-25), Red (26+)
- **Interactive tooltips** with date, count, and intensity
- **Visual design** matches WaniKani-inspired dashboard
- **Responsive layout** with proper spacing

---

### 7. Enhanced Kanji Cards ✅
**Status**: COMPLETED
**Completed**: 2026-01-15

**Goal**: Add stroke count SVG and example sentences to kanji flashcards.

**Completed Steps**:
- [x] Updated `src/components/Flashcard/Flashcard.tsx` - KanjiCard component:
  - [x] Added `strokeCount` prop display
  - [x] Fetches stroke order SVG from kanjiapi.dev API on mount
  - [x] Displays SVG stroke diagram in a styled container
  - [x] Loads example sentences from `tatoeba.json`
  - [x] Filters sentences containing the kanji (shows up to 2)
  - [x] Formats sentences as "Japanese — English"
  - [x] Loading states for SVG fetch

**Features**:
- **Stroke Order SVG**: Fetched dynamically from `https://kanjiapi.dev/v1/kanji/{character}`
- **Example Sentences**: Loaded from `tatoeba.json` (format: array of [id, japanese, id2, english])
- **Performance**: Dynamic import of tatoeba.json, filtered by kanji character
- **Fallback**: Uses provided examples prop if available, otherwise loads from tatoeba

---

## Backlog (Low Priority)

### 8. Configurable Daily Limits in Profile
**Status**: TODO
**Priority**: LOW

**Goal**: Allow users to configure their daily new card limit (currently hardcoded to 3).

**Proposed Implementation**:
- Add `daily_new_card_limit` column to `users` table (default: 3)
- Create settings UI in Profile page
- Update fetch functions to read user's preference
- Store in localStorage for offline access

**Files to Update**:
- [ ] Profile page - Add settings form
- [ ] Database schema - Add column to users table
- [ ] Fetch functions - Read user preference instead of hardcoded value
- [ ] GenericScheduler - Pass limit from user settings

---

**Last Updated**: 2026-01-15
