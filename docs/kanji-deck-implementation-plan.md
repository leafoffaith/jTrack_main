# Kanji Deck Implementation Plan (N5/N4/N3)

## Overview

Implement JLPT-level kanji decks (N5, N4, N3) using the existing JMDict/kanjidic data and the SuperMemo2 SRS algorithm already in place.

---

## 1. Data Source Analysis

### Kanji Bank Structure (`kanjidic_english/kanji_bank_*.json`)

Each kanji entry follows the Yomichan dictionary format:

```typescript
[
  kanji,           // [0] The kanji character (e.g., "日")
  onyomi,          // [1] On'yomi readings (e.g., "ニチ ジツ")
  kunyomi,         // [2] Kun'yomi readings (e.g., "ひ -び -か")
  tags,            // [3] Tags (e.g., "jouyou grade1")
  meanings,        // [4] Array of English meanings
  stats            // [5] Additional statistics/metadata
]
```

### Available Resources

| File | Purpose |
|------|---------|
| `kanji_bank_1.json`, `kanji_bank_2.json` | Full kanji dictionary data |
| `kanji_meta_bank_1.json` | Kanji frequency metadata |
| `term_meta_bank_*.json` | Word frequency (for example sentences) |
| `N5KanjiList.ts`, `N4KanjiList.ts`, `N3KanjiList.ts` | Existing JLPT classifications |

---

## 2. Database Schema

### New Table: `kanji_deck`

```sql
CREATE TABLE kanji_deck (
  id SERIAL PRIMARY KEY,
  kanji VARCHAR(1) UNIQUE NOT NULL,
  onyomi TEXT[],
  kunyomi TEXT[],
  meanings TEXT[],
  jlpt_level VARCHAR(2) CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
  frequency INTEGER,
  stroke_count INTEGER,
  example_words JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_kanji_jlpt ON kanji_deck(jlpt_level);
CREATE INDEX idx_kanji_frequency ON kanji_deck(frequency);
```

### Update `studied_flashcards`

The existing table already supports kanji via `original_deck = 'kanji'`. Add optional kanji-specific fields:

```sql
ALTER TABLE studied_flashcards 
ADD COLUMN IF NOT EXISTS kanji_meaning TEXT;
```

---

## 3. File Structure

```
src/
├── components/
│   ├── Kanji/
│   │   ├── index.tsx                 # Barrel export
│   │   ├── Kanji.tsx                 # Level selection UI
│   │   ├── KanjiCard.tsx             # Card display component
│   │   └── KanjiDetails.tsx          # Detailed reading/meaning view
│   ├── SuperMemo/
│   │   └── KanjiScheduler.tsx        # ✅ Already exists
│   └── Fetching/
│       └── useKanjiFetch.ts          # ✅ Already exists
├── utils/
│   └── kanjiParser.ts                # Parse kanji_bank JSON
└── constants/
    └── jlptKanji.ts                  # JLPT level mappings
```

---

## 4. Implementation Tasks

### Phase 1: Data Preparation (Priority: High)

#### Task 1.1: Create Kanji Parser Utility
**File:** `src/utils/kanjiParser.ts`

```typescript
export interface ParsedKanji {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  tags: string;
  jlptLevel: 'N5' | 'N4' | 'N3' | null;
}

export function parseKanjiBank(rawData: any[]): ParsedKanji[];
export function getKanjiByLevel(level: 'N5' | 'N4' | 'N3'): ParsedKanji[];
```

#### Task 1.2: Consolidate JLPT Lists
**File:** `src/constants/jlptKanji.ts`

Merge existing `N5KanjiList.ts`, `N4KanjiList.ts`, `N3KanjiList.ts` into a single source:

```typescript
export const JLPT_KANJI_MAP: Record<string, 'N5' | 'N4' | 'N3'> = {
  '一': 'N5', '二': 'N5', '三': 'N5', // ... N5 (~80 kanji)
  '会': 'N4', '同': 'N4', '事': 'N4', // ... N4 (~170 kanji)
  '政': 'N3', '議': 'N3', '民': 'N3', // ... N3 (~370 kanji)
};

export function getJLPTLevel(kanji: string): 'N5' | 'N4' | 'N3' | null;
```

---

### Phase 2: Data Import (Priority: High)

#### Task 2.1: Create Import Script
**File:** `scripts/importKanji.ts`

```typescript
// 1. Load kanji_bank_1.json and kanji_bank_2.json
// 2. Parse each entry using kanjiParser
// 3. Cross-reference with JLPT_KANJI_MAP
// 4. Upsert to Supabase kanji_deck table
```

**Run:** `npx ts-node scripts/importKanji.ts`

---

### Phase 3: Type Definitions (Priority: Medium)

#### Task 3.1: Kanji Types
**File:** `src/components/Fetching/types.ts`

Add to existing types:

```typescript
export interface KanjiItem {
  id: number;
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  jlpt_level: 'N5' | 'N4' | 'N3';
  frequency?: number;
  stroke_count?: number;
}

export interface KanjiFlashcardItem extends FlashcardItem {
  kanjiData?: KanjiItem;
}
```

---

### Phase 4: Fetching Logic (Priority: Medium)

#### Task 4.1: Update `useKanjiFetch.ts`
Adapt existing file to:
- Fetch by JLPT level
- Use `sharedCardFetch.ts` patterns
- Integrate with `CacheManager`

```typescript
export const fetchKanjiByLevel = async (
  userId: string,
  level: 'N5' | 'N4' | 'N3'
): Promise<CardFetchResult>;

export const fetchDueKanji = async (userId: string): Promise<CardFetchResult>;
export const fetchNewKanji = async (userId: string, level: string): Promise<CardFetchResult>;
```

---

### Phase 5: UI Components (Priority: Medium)

#### Task 5.1: Update Kanji Level Selector
**File:** `src/components/Kanji/Kanji.tsx`

Add UI for selecting N5/N4/N3:

```tsx
<div className="grid grid-cols-3 gap-4">
  <LevelCard level="N5" count={80} onClick={() => navigate('/learn/kanji?level=N5')} />
  <LevelCard level="N4" count={170} onClick={() => navigate('/learn/kanji?level=N4')} />
  <LevelCard level="N3" count={370} onClick={() => navigate('/learn/kanji?level=N3')} />
</div>
```

#### Task 5.2: Update KanjiScheduler
**File:** `src/components/SuperMemo/KanjiScheduler.tsx`

- Read `level` from URL params
- Pass level to fetch functions
- Display readings (onyomi/kunyomi) on card back

---

### Phase 6: Routing (Priority: Low)

#### Task 6.1: Update Routes
**File:** `src/main.tsx`

Routes already exist:
```tsx
{ path: '/learn/kanji', element: <KanjiScheduler /> }
```

Add level-specific handling via query params: `/learn/kanji?level=N5`

---

## 5. Implementation Order

| Step | Task | Est. Time | Dependencies |
|------|------|-----------|--------------|
| 1 | Create `jlptKanji.ts` from existing lists | 1h | None |
| 2 | Build `kanjiParser.ts` utility | 2h | Step 1 |
| 3 | Create Supabase `kanji_deck` table | 30m | None |
| 4 | Build and run import script | 2h | Steps 1-3 |
| 5 | Add types to `Fetching/types.ts` | 30m | Step 2 |
| 6 | Update `useKanjiFetch.ts` | 2h | Steps 4-5 |
| 7 | Update Kanji level selector UI | 1.5h | Step 6 |
| 8 | Update `KanjiScheduler.tsx` | 2h | Steps 6-7 |
| 9 | Add caching for kanji data | 1h | Step 6 |
| 10 | Testing & polish | 2h | All |

**Total Estimated Time: ~15 hours**

---

## 6. Key Integration Points

### SRS Algorithm
Use existing `supermemo()` from `SuperMemoAlgo.ts`:
```typescript
import { supermemo, SuperMemoGrade } from 'supermemo';
const updated = supermemo({ interval, repetition, efactor }, grade);
```

### Caching
Leverage `CacheManager` with extended TTL for static kanji data:
```typescript
// In cacheManager.ts, consider adding:
KANJI_DECK: 30 * 60 * 1000, // 30 minutes (static data)
```

### Authentication
Use existing `userIdHelper.ts`:
```typescript
const numericUserId = await getNumericUserId(userId);
```

---

## 7. Card Display Format

### Front (Question)
```
┌─────────────────┐
│                 │
│       日        │  ← Large kanji character
│                 │
│      N5         │  ← JLPT level badge
└─────────────────┘
```

### Back (Answer)
```
┌─────────────────┐
│       日        │
├─────────────────┤
│ Meaning: sun, day, Japan │
├─────────────────┤
│ On'yomi:  ニチ、ジツ     │
│ Kun'yomi: ひ、-び、-か   │
├─────────────────┤
│ Examples: 日本、今日     │
└─────────────────┘
```

---

## 8. Success Criteria

- [ ] All N5 kanji (80) imported and displayable
- [ ] All N4 kanji (170) imported and displayable  
- [ ] All N3 kanji (370) imported and displayable
- [ ] SRS intervals working correctly for kanji
- [ ] Progress tracked per-level in profile
- [ ] Caching functional with appropriate TTL
- [ ] Card counts showing new/due/studied per level
