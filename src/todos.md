# JTrack Development Todos

## Completed Tasks ✅

### 1. Fix Frontend Loading Issue ✅
**Status**: COMPLETED

**Problem**: Frontend was showing blank page - RouterProvider wasn't wrapped in App component, so it didn't have access to QueryClientProvider context.

**Files Changed**:
- `src/main.tsx:70-75` - Wrapped RouterProvider inside App component

---

## Pending Tasks

### 2. Consolidate Scheduler Logic into Generic Component
**Status**: IN PROGRESS
**Priority**: HIGH (makes tasks 3 & 4 much easier)

**Goal**: HiraganaScheduler and KatakanaScheduler share ~99% identical code (348 and 351 lines respectively). Create a reusable GenericScheduler component.

**Current Duplication**:
- Same state management (isFlipped, isExiting, currentCardIndex, etc.)
- Identical SuperMemo 2 algorithm implementation
- Same UI layout and controls
- Same cache update logic
- Only differences: deck name, fetch functions, card component type

**Step 1: Create Type Definitions**
- [x] Create `src/components/SuperMemo/types.ts` with DeckConfig, DeckFetchFunctions, GenericSchedulerProps, UpdatedFlashcard, StudiedFlashcardData interfaces

**Step 2: Create Deck Configurations**
- [x] Create `src/components/SuperMemo/configs/deckConfigs.ts` with HIRAGANA_CONFIG and KATAKANA_CONFIG
  - [x] HIRAGANA_CONFIG - uses fetchAvailableHiragana, HiraganaCard
  - [x] KATAKANA_CONFIG - uses fetchAvailableKatakana, KatakanaCard, dailyDueCards limit

**Step 3: Create Generic Scheduler Component**
- [ ] Create `src/components/SuperMemo/GenericScheduler.tsx`
  - [ ] Copy entire logic from HiraganaScheduler.tsx as starting point
  - [ ] Replace hardcoded 'hiragana' with `config.deckType`
  - [ ] Replace fetch function calls with `config.fetchFunctions.fetchAvailable()` etc.
  - [ ] Replace `<HiraganaCard>` with `<config.CardComponent>`
  - [ ] Replace mode labels with `config.modeLabel[mode]`
  - [ ] Add cache update after DB upsert (fixes KatakanaScheduler bug)
  - [ ] Use `config.limits?.dailyDueCards` for due card limiting if specified

**Step 4: Refactor Existing Schedulers**
- [ ] Update `src/components/SuperMemo/HiraganaScheduler.tsx` to wrapper component
  - [ ] Import GenericScheduler and HIRAGANA_CONFIG
  - [ ] Replace entire implementation with simple wrapper: `<GenericScheduler config={HIRAGANA_CONFIG} />`
- [ ] Update `src/components/SuperMemo/KatakanaScheduler.tsx` to wrapper component
  - [ ] Import GenericScheduler and KATAKANA_CONFIG
  - [ ] Replace entire implementation with simple wrapper: `<GenericScheduler config={KATAKANA_CONFIG} />`

**Step 5: Update sessionHelper for Generic Deck Types**
- [ ] Update `src/components/Client/sessionHelper.ts`
  - [ ] Change `getNewCardsShownToday` parameter from `'hiragana' | 'katakana'` to `string`
  - [ ] Change `markNewCardShown` parameter from `'hiragana' | 'katakana'` to `string`

**Step 6: Remove Debug Logging**
- [ ] Remove debug logging from `src/components/Fetching/useKatakanaFetch.ts`
  - [ ] Remove all fetch calls to `http://127.0.0.1:7242`
  - [ ] Clean up `#region agent log` blocks
- [ ] Remove debug logging from `src/components/Fetching/sharedCardFetch.ts`
  - [ ] Remove all fetch calls to `http://127.0.0.1:7242`
  - [ ] Clean up `#region agent log` blocks

**Step 7: Testing & Verification**
- [ ] Run `npm run dev` - ensure no TypeScript errors
- [ ] Test Hiragana scheduler - study cards, verify cache updates in DevTools → IndexedDB
- [ ] Test Katakana scheduler - study cards, verify 3 due card limit works
- [ ] Verify no network calls to 127.0.0.1:7242 in Network tab
- [ ] Check both schedulers behave identically (except deck content)
- [ ] Verify completion screen shows after finishing available cards
- [ ] Test mode switching (new/due/all) via URL parameters

---

### 3. Create Kanji Scheduler
**Status**: TODO (partially implemented - has stub)
**Depends On**: Task 2 (optional but recommended)

**Goal**: Implement functional Kanji study mode using the scheduler system.

**Current State**:
- `src/components/SuperMemo/KanjiScheduler.tsx` - Currently shows "Under Construction" message
- `src/components/Fetching/useKanjiFetch.ts` - Fetch logic already exists with kanjiapi.dev integration
- Routing already exists in `src/main.tsx:47-50`

**Files to Update**:
- [ ] `src/components/SuperMemo/KanjiScheduler.tsx` - Implement full scheduler (use GenericScheduler if available)
- [ ] `src/components/Flashcard/Flashcard.tsx` - Add KanjiCard component if not exists
- [ ] `src/components/Fetching/useKanjiFetch.ts` - Verify and adapt to match shared pattern

**Implementation Notes**:
- Kanji cards need different back content (meanings, readings, stroke count)
- Database table `kanji` already exists in Supabase
- Need to handle complex kanji data structure (meanings array, multiple readings)

---

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

**Last Updated**: 2026-01-08
