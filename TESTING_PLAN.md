# JTrack Testing Plan

## Overview

This document outlines a comprehensive testing strategy for the JTrack spaced repetition system. The goal is to achieve high confidence in critical paths while maintaining test maintainability.

### Current Status
- **Test Framework**: Vitest with jsdom, React Testing Library
- **Existing Coverage**: 4 test files (data format, database connection, flashcard creation, available flashcards)
- **Target Coverage**: 80%+ for critical paths (SRS algorithm, caching, data flow)

---

## Testing Strategy

### Test Pyramid
1. **Unit Tests (60%)** - Fast, isolated tests for pure functions and utilities
2. **Integration Tests (30%)** - Tests for data flow and component interactions
3. **E2E Tests (10%)** - Critical user journeys (manual or automated)

### Priority Matrix

| Priority | Area | Rationale |
|----------|------|-----------|
| P0 (Critical) | SuperMemo algorithm, Cache logic, Data fetching | Core functionality, data integrity |
| P1 (High) | Scheduler components, Daily limits, Card filtering | User-facing features, business logic |
| P2 (Medium) | UI components, Navigation, Error handling | UX and robustness |
| P3 (Low) | Edge cases, Performance, Accessibility | Quality improvements |

---

## 1. Unit Tests

### 1.1 SuperMemo Algorithm (`src/components/SuperMemo/`)

**File**: `GenericScheduler.test.tsx`

**Tests**:
- ✅ `practiceFlashcard()` calculates correct interval/efactor for each grade (1-5)
- ✅ `practiceFlashcard()` handles brand new cards (interval=1, repetition=0, efactor=2.5)
- ✅ `practiceFlashcard()` calculates future due_date correctly (dayjs interval)
- ✅ Grade 1 (Again) resets card to beginning
- ✅ Grade 5 (Easy) maximizes interval increase
- ✅ EFactor stays within bounds (1.3 - 2.5)

**Example**:
```typescript
describe('SuperMemo Algorithm', () => {
  it('should calculate correct interval for grade 5 (Easy)', () => {
    const flashcard: FlashcardItem = {
      front: 'あ',
      back: 'a',
      interval: 3,
      repetition: 2,
      efactor: 2.5
    };
    const result = practiceFlashcard(flashcard, 5);
    expect(result.interval).toBeGreaterThan(3);
    expect(result.efactor).toBe(2.5); // EFactor max
  });
});
```

---

### 1.2 CacheManager (`src/lib/CacheManager.ts`)

**File**: `CacheManager.test.ts`

**Tests**:
- ✅ `isCacheValid()` returns true for fresh cache (< TTL)
- ✅ `isCacheValid()` returns false for expired cache (> TTL)
- ✅ `getStudiedFlashcards()` returns cached data when valid
- ✅ `getStudiedFlashcards()` returns null when expired
- ✅ `getStudiedFlashcards()` bypasses cache with forceRefresh=true
- ✅ `updateStudiedFlashcards()` clears old cache before adding new
- ✅ `updateStudiedFlashcards()` sets correct cached_at timestamp
- ✅ `updateSingleFlashcard()` updates existing card in cache
- ✅ `updateSingleFlashcard()` adds new card if not found
- ✅ `getDeckMetadata()` respects 2min TTL
- ✅ `updateDeckMetadata()` updates existing or inserts new
- ✅ `clearUserCache()` removes all user data
- ✅ `clearExpiredCache()` only removes expired entries
- ✅ `getCacheStats()` returns correct counts

**Mock Setup**:
```typescript
vi.mock('../../lib/db', () => ({
  db: {
    studiedFlashcards: {
      where: vi.fn(),
      toArray: vi.fn(),
      bulkAdd: vi.fn(),
      delete: vi.fn()
    }
  }
}));
```

---

### 1.3 Shared Card Fetching (`src/components/Fetching/sharedCardFetch.ts`)

**File**: `sharedCardFetch.test.ts`

**Tests**:
- ✅ `fetchUserStudiedCards()` returns cached data first
- ✅ `fetchUserStudiedCards()` falls back to database on cache miss
- ✅ `fetchUserStudiedCards()` updates cache after database fetch
- ✅ `filterDueCards()` only returns cards with due_date <= now
- ✅ `filterDueCards()` excludes cards with future due_date
- ✅ `filterDueCards()` excludes cards without due_date
- ✅ `filterNewCards()` excludes studied card fronts
- ✅ `convertToFlashcardItem()` sets correct defaults (interval=1, repetition=0, efactor=2.5)
- ✅ `fetchDueCards()` returns empty array for unauthenticated user
- ✅ `fetchNewCards()` respects daily limit (default 3)
- ✅ `fetchNewCards()` excludes cards shown today
- ✅ `fetchNewCards()` returns message when daily limit reached
- ✅ `fetchNewCards()` filters out already studied cards

---

### 1.4 User ID Mapping (`src/components/Client/userIdHelper.ts`)

**File**: `userIdHelper.test.ts` (expand existing)

**Tests**:
- ✅ Hash-based UUID → numeric conversion is consistent
- ✅ Hash collision handling (if applicable)
- ✅ Falls back to hash when database lookup fails
- ✅ Returns same numeric ID for same UUID

---

### 1.5 Session Management (`src/components/Client/sessionHelper.ts`)

**File**: `sessionHelper.test.ts`

**Tests**:
- ✅ `initializeSession()` creates new session if none exists
- ✅ `initializeSession()` resets session if date changed (IST timezone)
- ✅ `markNewCardShown()` adds card to today's shown list
- ✅ `markNewCardShown()` doesn't duplicate cards
- ✅ `getNewCardsShownToday()` returns correct count per deck
- ✅ Daily limit enforces IST timezone boundaries

**Example**:
```typescript
describe('Session Management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should reset session when date changes (IST)', () => {
    // Set session for yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    localStorage.setItem('session', JSON.stringify({
      date: yesterday.toISOString(),
      hiragana: ['あ', 'い']
    }));

    initializeSession();
    const session = JSON.parse(localStorage.getItem('session')!);
    expect(session.hiragana).toEqual([]);
  });
});
```

---

### 1.6 Data Transformations

**File**: `dataTransformations.test.ts`

**Tests**:
- ✅ FlashcardItem → StudiedFlashcardData conversion (already exists)
- ✅ Handling missing optional fields (back, due_date)
- ✅ Date ISO format validation
- ✅ Deck type validation (hiragana, katakana, kanji, sentence)

---

## 2. Integration Tests

### 2.1 GenericScheduler Component

**File**: `GenericScheduler.integration.test.tsx`

**Tests**:
- ✅ Fetches due cards in 'due' mode
- ✅ Fetches new cards in 'new' mode (respects daily limit)
- ✅ Fetches due → new in default mode
- ✅ Updates Supabase on card rating
- ✅ Updates cache optimistically after rating
- ✅ Advances to next card after rating
- ✅ Shows completion message when all cards done
- ✅ Shows custom message when daily limit reached
- ✅ Marks new cards as shown via sessionHelper
- ✅ Handles authentication errors gracefully
- ✅ Handles database errors without crashing

**Mock Strategy**:
```typescript
vi.mock('../Client/supaClient', () => ({
  supaClient: {
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      eq: vi.fn()
    }))
  }
}));
```

---

### 2.2 Data Fetching Hooks

**File**: `useHiraganaFetch.integration.test.ts`

**Tests**:
- ✅ `fetchAvailableFlashcards()` returns due cards first
- ✅ `fetchAvailableFlashcards()` returns new cards after due cards
- ✅ `fetchAvailableFlashcards()` respects daily limit for new cards
- ✅ `fetchNewFlashcards()` excludes cards shown today
- ✅ `fetchDueFlashcards()` only returns cards due today or earlier
- ✅ Caching works correctly for all fetch functions
- ✅ Force refresh bypasses cache

**Repeat for**: `useKatakanaFetch`, `useKanjiFetch`, `useSentenceFetch`

---

### 2.3 Authentication Flow

**File**: `authFlow.integration.test.tsx`

**Tests**:
- ✅ `useAuth()` returns userId when authenticated
- ✅ `useAuth()` redirects to login when unauthenticated
- ✅ Login sets session correctly
- ✅ Logout clears cache via CacheManager
- ✅ Protected routes require authentication

---

### 2.4 Deck Metadata Caching

**File**: `deckMetadata.integration.test.ts`

**Tests**:
- ✅ `useCardCounts()` fetches metadata from cache first
- ✅ `useCardCounts()` updates cache after database fetch
- ✅ Metadata cache expires after 2 minutes
- ✅ Cache invalidates after rating a card

---

### 2.5 Three-Tier Data Flow

**File**: `dataFlow.integration.test.ts`

**Tests**:
- ✅ UI action → Cache update → Database sync (optimistic update)
- ✅ Cache miss → Database fetch → Cache update
- ✅ Expired cache triggers database fetch
- ✅ Cache cleared on logout
- ✅ Multiple concurrent updates handled correctly

---

## 3. Component Tests

### 3.1 Flashcard Component

**File**: `Flashcard.test.tsx`

**Tests**:
- ✅ Renders front content correctly
- ✅ Flips to show back content on click
- ✅ Shows "New" badge for new cards
- ✅ Shows "Due" badge for due cards
- ✅ Applies correct styling for different positions (active, queue-1, queue-2)
- ✅ Exit animation plays on card removal
- ✅ onFlip callback fires correctly

---

### 3.2 UI Components (Sampling)

**Files**: `Button.test.tsx`, `Card.test.tsx`, `Select.test.tsx`

**Tests** (for each):
- ✅ Renders with different variants
- ✅ Handles click/change events
- ✅ Applies correct accessibility attributes
- ✅ Supports disabled state

---

## 4. E2E Tests (Manual or Automated)

### 4.1 Complete Study Session Flow

**Scenario**: New user studies Hiragana for the first time

**Steps**:
1. User logs in
2. Navigates to /learn/hiragana
3. Sees 3 new cards (daily limit)
4. Rates first card as "Easy"
5. Advances to second card
6. Rates second card as "Again"
7. Completes all 3 cards
8. Sees completion message
9. Returns tomorrow, sees cards due for review

**Assertions**:
- Daily limit enforced
- Cards marked as shown in localStorage
- Supabase updated with correct SRS values
- Cache updated optimistically
- Due cards shown on next day

---

### 4.2 Daily Limit Enforcement

**Scenario**: User tries to study more than daily limit

**Steps**:
1. User studies 3 new Hiragana cards
2. User navigates back to /learn/hiragana?mode=new
3. Sees "Come back tomorrow" message
4. User studies Katakana (separate limit)
5. Successfully studies 3 Katakana cards

**Assertions**:
- Daily limit per deck type
- Limit resets at IST timezone boundary
- localStorage tracks cards correctly

---

### 4.3 Card Prioritization

**Scenario**: User has both due and new cards

**Steps**:
1. User has 5 due cards and 10 unstudied cards
2. User navigates to /learn/hiragana (default mode)
3. Sees due cards first
4. After finishing due cards, sees new cards (up to daily limit)

**Assertions**:
- Due cards always shown first
- New cards shown only after due cards
- Daily limit applies to new cards only

---

### 4.4 Cache Behavior

**Scenario**: User studies, logs out, logs back in

**Steps**:
1. User studies 5 cards
2. User logs out
3. User logs back in
4. User navigates to /learn/hiragana
5. Data fetched fresh from database (cache cleared on logout)

**Assertions**:
- Cache cleared on logout
- Data consistent after re-authentication

---

## 5. Error Handling & Edge Cases

### 5.1 Network Failures

**Tests**:
- ✅ Graceful fallback when Supabase is unreachable
- ✅ Retry logic for transient failures
- ✅ User-friendly error messages

---

### 5.2 Invalid Data

**Tests**:
- ✅ Handle missing required fields in database responses
- ✅ Handle malformed dates
- ✅ Handle negative intervals/repetitions
- ✅ Handle efactor outside 1.3-2.5 range

---

### 5.3 Race Conditions

**Tests**:
- ✅ Multiple rapid card ratings
- ✅ Concurrent cache updates
- ✅ Session boundary during active study

---

## 6. Performance Tests

### 6.1 Cache Performance

**Tests**:
- ✅ Cache read is faster than database fetch (benchmark)
- ✅ Bulk cache updates don't block UI
- ✅ Expired cache cleanup runs efficiently

---

### 6.2 Load Times

**Tests**:
- ✅ Initial flashcard load < 500ms (with cache)
- ✅ Card flip animation is smooth (60fps)
- ✅ Navigation between decks is instant

---

## 7. Test Utilities & Setup

### 7.1 Mock Factories

**File**: `src/test/factories.ts`

```typescript
export const createMockFlashcard = (overrides?: Partial<FlashcardItem>): FlashcardItem => ({
  front: 'あ',
  back: 'a',
  interval: 1,
  repetition: 0,
  efactor: 2.5,
  due_date: new Date().toISOString(),
  ...overrides
});

export const createMockStudiedFlashcard = (overrides?: Partial<StudiedFlashcardData>): StudiedFlashcardData => ({
  user_id: 12345,
  front: 'あ',
  back: 'a',
  interval: 1,
  repetition: 0,
  efactor: 2.5,
  due_date: new Date().toISOString(),
  original_deck: 'hiragana',
  last_studied: new Date().toISOString(),
  ...overrides
});
```

---

### 7.2 Test Helpers

**File**: `src/test/helpers.ts`

```typescript
export const setupAuthenticatedUser = () => {
  const mockUserId = 'test-uuid-123';
  vi.mock('../components/Client/useAuth', () => ({
    useAuth: () => ({ userId: mockUserId, isLoading: false })
  }));
  return mockUserId;
};

export const setupSupabaseMock = () => {
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();

  vi.mock('../components/Client/supaClient', () => ({
    supaClient: {
      from: vi.fn(() => ({
        select: selectMock,
        insert: insertMock,
        update: updateMock,
        eq: vi.fn(() => ({ maybeSingle: vi.fn() }))
      }))
    }
  }));

  return { selectMock, insertMock, updateMock };
};

export const setupLocalStorageSession = (date: Date, shownCards: { [deck: string]: string[] }) => {
  localStorage.setItem('session', JSON.stringify({
    date: date.toISOString(),
    ...shownCards
  }));
};
```

---

### 7.3 Custom Matchers

**File**: `src/test/matchers.ts`

```typescript
expect.extend({
  toBeValidISODate(received: string) {
    const date = new Date(received);
    const isValid = !isNaN(date.getTime()) && date.toISOString() === received;
    return {
      message: () => `expected ${received} to be valid ISO date`,
      pass: isValid
    };
  },

  toBeWithinSuperMemoRange(received: number) {
    const isValid = received >= 1.3 && received <= 2.5;
    return {
      message: () => `expected efactor ${received} to be within 1.3-2.5`,
      pass: isValid
    };
  }
});
```

---

## 8. Coverage Goals

### Target Coverage by Area

| Area | Line Coverage | Branch Coverage |
|------|---------------|-----------------|
| SuperMemo algorithm | 100% | 100% |
| CacheManager | 95% | 90% |
| Shared fetching utilities | 90% | 85% |
| Scheduler components | 85% | 80% |
| User ID mapping | 90% | 85% |
| Session management | 90% | 85% |
| UI components | 70% | 60% |

### Overall Target
- **Line Coverage**: 80%+
- **Branch Coverage**: 75%+

---

## 9. CI/CD Integration

### Pre-commit Hooks
```bash
npm test                # Run all tests
npm run test:coverage   # Check coverage thresholds
npm run lint            # Linting
```

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3  # Upload coverage
```

---

## 10. Implementation Roadmap

### Phase 1 (Week 1-2): Critical Path Coverage
- ✅ SuperMemo algorithm tests
- ✅ CacheManager tests
- ✅ Shared fetching utilities tests
- ✅ Session management tests

### Phase 2 (Week 3-4): Integration Tests
- ✅ GenericScheduler integration tests
- ✅ Data fetching hooks tests
- ✅ Authentication flow tests
- ✅ Three-tier data flow tests

### Phase 3 (Week 5-6): Component & E2E Tests
- ✅ Flashcard component tests
- ✅ UI component sampling tests
- ✅ Manual E2E test scenarios
- ✅ Error handling tests

### Phase 4 (Week 7-8): Polish & Optimization
- ✅ Performance tests
- ✅ Edge case coverage
- ✅ Test utilities refinement
- ✅ CI/CD integration
- ✅ Documentation updates

---

## 11. Maintenance Strategy

### Test Hygiene
- **Keep tests fast**: Unit tests < 100ms, integration tests < 1s
- **Keep tests isolated**: No shared state between tests
- **Keep tests readable**: Descriptive test names, clear assertions
- **Keep tests up-to-date**: Update tests when features change

### Regular Reviews
- **Weekly**: Check flaky tests, update mocks
- **Monthly**: Review coverage reports, identify gaps
- **Quarterly**: Refactor test utilities, optimize slow tests

---

## 12. Known Technical Debt to Address

From CLAUDE.md:

1. **Debug Logging**: Remove `http://127.0.0.1:7242` logging in production
2. **Scheduler Duplication**: 80% code overlap in HiraganaScheduler/KatakanaScheduler/KanjiScheduler - consolidate
3. **User ID Collision Risk**: Hash-based UUID→numeric conversion needs production solution
4. **Hardcoded Settings**: Daily limits (3 cards) and timezone (IST) should be configurable

**Testing Implications**:
- Add tests to verify debug logging is disabled in production builds
- Test GenericScheduler thoroughly to support scheduler consolidation
- Test user ID collision scenarios (rare but possible)
- Add tests for configurable settings when implemented

---

## Conclusion

This testing plan provides comprehensive coverage for JTrack's critical paths while remaining pragmatic about test maintenance. By following the phased implementation roadmap, you'll achieve high confidence in your SRS algorithm, caching layer, and data flow - the three pillars of JTrack's architecture.

**Next Steps**:
1. Review and approve this plan
2. Set up test utilities and factories (Phase 0)
3. Begin Phase 1 implementation (critical path coverage)
4. Track progress using coverage reports
5. Iterate based on findings

---

*Last Updated*: 2026-01-15
