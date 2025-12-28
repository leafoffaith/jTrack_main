# Romanization Flashcard Implementation Plan

## Overview
Implement a new flashcard type for Hiragana and Katakana where users see romanization (e.g., "a", "ka", "shi") and select the correct kana character from 4 multiple-choice options.

## Current State Analysis

### Existing Flashcard Types
1. **Standard Kana Flashcards**: Show kana character → user recalls romanization
2. **Kanji Flashcards**: Show kanji → user recalls readings/meanings

### Existing Components
- `Flashcard.tsx`: Main flashcard component with flip animation
- `HiraganaCard`, `KatakanaCard`, `KanjiCard`: Specialized content components
- `RenderButtons.tsx`: Multiple choice button renderer
- `FlashcardItem` interface: Base flashcard data structure

## Implementation Plan

### Phase 1: Data Structure & Types

#### 1.1 Update FlashcardItem Interface
**File**: `src/components/Flashcard/FlashcardItem.tsx`

Add new optional field:
```typescript
export interface FlashcardItem extends SuperMemoItem {
  front: string
  back?: string
  kanjiBack?: { ... }
  options?: string[]  // Already exists
  due_date?: string
  _userID?: number
  flashcardType?: 'standard' | 'romanization' | 'kanji'  // NEW
}
```

#### 1.2 Update Database Schema
**Table**: `studied_flashcards`

Consider adding:
- `flashcard_type` column (text: 'standard', 'romanization', 'kanji')
- Or use `original_deck` with suffix (e.g., 'hiragana_romanization')

### Phase 2: Option Generation Logic

#### 2.1 Create Option Generator Utility
**File**: `src/components/Fetching/generateKanaOptions.ts` (NEW)

```typescript
/**
 * Generate 4 multiple choice options for a kana character
 * @param correctKana - The correct kana character
 * @param allKana - All available kana characters for this deck
 * @returns Array of 4 kana characters (1 correct + 3 incorrect)
 */
export const generateKanaOptions = (
  correctKana: string,
  allKana: string[]
): string[] => {
  // 1. Start with correct answer
  const options = [correctKana];
  
  // 2. Filter out the correct answer from pool
  const incorrectPool = allKana.filter(k => k !== correctKana);
  
  // 3. Randomly select 3 incorrect options
  const shuffled = incorrectPool.sort(() => Math.random() - 0.5);
  options.push(...shuffled.slice(0, 3));
  
  // 4. Shuffle all 4 options
  return options.sort(() => Math.random() - 0.5);
};
```

### Phase 3: Fetch Functions

#### 3.1 Update Hiragana Fetch
**File**: `src/components/Fetching/useHiraganaFetch.ts`

Add new function:
```typescript
export const fetchRomanizationHiragana = async (
  userId: string
): Promise<CardFetchResult> => {
  // Similar to fetchNewHiragana but:
  // 1. Swap front/back (romanization becomes front)
  // 2. Generate 4 options for each card
  // 3. Set flashcardType: 'romanization'
};
```

#### 3.2 Update Katakana Fetch
**File**: `src/components/Fetching/useKatakanaFetch.ts`

Add similar function for katakana.

### Phase 4: UI Component

#### 4.1 Create Romanization Flashcard Component
**File**: `src/components/Flashcard/RomanizationFlashcard.tsx` (NEW)

```typescript
interface RomanizationFlashcardProps {
  romanization: string;  // e.g., "ka"
  correctKana: string;   // e.g., "か"
  options: string[];     // 4 kana options
  onSelect: (selected: string) => void;
  isAnswered: boolean;
  selectedOption?: string;
}

export const RomanizationFlashcard: React.FC<RomanizationFlashcardProps> = ({
  romanization,
  correctKana,
  options,
  onSelect,
  isAnswered,
  selectedOption
}) => {
  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Select the correct kana for:
        </p>
        <p className="text-6xl font-bold">{romanization}</p>
      </div>
      
      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !isAnswered && onSelect(option)}
            disabled={isAnswered}
            className={cn(
              "text-4xl p-8 rounded-lg border-2 transition-all",
              isAnswered && option === correctKana && "bg-green-100 border-green-500",
              isAnswered && option === selectedOption && option !== correctKana && "bg-red-100 border-red-500",
              !isAnswered && "hover:bg-accent hover:border-primary"
            )}
          >
            {option}
          </button>
        ))}
      </div>
      
      {/* Feedback */}
      {isAnswered && (
        <div className="text-center">
          {selectedOption === correctKana ? (
            <p className="text-green-600 font-semibold">Correct! ✓</p>
          ) : (
            <p className="text-red-600 font-semibold">
              Incorrect. The answer is {correctKana}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
```

#### 4.2 Integrate with Main Flashcard Component
**File**: `src/components/Flashcard/Flashcard.tsx`

Add conditional rendering:
```typescript
{flashcardType === 'romanization' && options ? (
  <RomanizationFlashcard
    romanization={front}
    correctKana={back}
    options={options}
    onSelect={handleOptionSelect}
    isAnswered={isAnswered}
    selectedOption={selectedOption}
  />
) : (
  // Existing standard flashcard rendering
)}
```

### Phase 5: Scheduler Updates

#### 5.1 Update HiraganaScheduler
**File**: `src/components/SuperMemo/HiraganaScheduler.tsx`

1. Read `type` query parameter: `?mode=new&type=romanization`
2. Call appropriate fetch function based on type
3. Handle option selection and validation
4. Only call SuperMemo practice on correct answer

```typescript
const [searchParams] = useSearchParams();
const mode = searchParams.get('mode');
const type = searchParams.get('type'); // 'standard' or 'romanization'

// In fetchFlashcards:
if (type === 'romanization') {
  result = await fetchRomanizationHiragana(userId);
} else if (mode === 'new') {
  result = await fetchNewHiragana(userId);
}

// Handle option selection:
const handleOptionSelect = (selected: string) => {
  setSelectedOption(selected);
  setIsAnswered(true);
  
  if (selected === currentFlashcard.back) {
    // Correct answer - practice with grade 5 (Easy)
    setTimeout(() => practice(5), 1000);
  } else {
    // Incorrect answer - practice with grade 1 (Again)
    setTimeout(() => practice(1), 1000);
  }
};
```

#### 5.2 Update KatakanaScheduler
Similar changes as HiraganaScheduler.

### Phase 6: Deck Selection UI

#### 6.1 Add Toggle for Flashcard Type
**File**: `src/components/DeckSelect/DeckSelect.tsx`

For hiragana and katakana decks, add a toggle or separate buttons:
- "Study Standard" (show kana → recall romanization)
- "Study Romanization" (show romanization → select kana)

Or use a dropdown/tabs to switch between types.

### Phase 7: Database Tracking

#### 7.1 Track Romanization Progress Separately
When saving to `studied_flashcards`:
- Use `original_deck` = 'hiragana_romanization' or 'katakana_romanization'
- Or add `flashcard_type` column

This allows separate progress tracking for:
- Standard kana recognition
- Romanization-to-kana conversion

### Phase 8: Testing Checklist

- [ ] Options are randomized and include correct answer
- [ ] No duplicate options
- [ ] Correct answer validation works
- [ ] SuperMemo algorithm applies correctly
- [ ] Progress is tracked separately from standard cards
- [ ] UI shows correct/incorrect feedback
- [ ] Animations work smoothly
- [ ] Works for both hiragana and katakana
- [ ] Daily limits apply correctly
- [ ] Due cards are prioritized

## Future Enhancements

1. **Adaptive Difficulty**: Show similar-looking kana as distractors (e.g., シ/ツ, ソ/ン)
2. **Audio Support**: Play pronunciation when showing romanization
3. **Timed Mode**: Add optional timer for extra challenge
4. **Mixed Mode**: Combine standard and romanization in one session
5. **Statistics**: Track accuracy rate for romanization vs standard

## File Summary

### New Files
- `src/components/Fetching/generateKanaOptions.ts`
- `src/components/Flashcard/RomanizationFlashcard.tsx`
- `docs/romanization-flashcard-plan.md`

### Modified Files
- `src/components/Flashcard/FlashcardItem.tsx`
- `src/components/Flashcard/Flashcard.tsx`
- `src/components/Fetching/useHiraganaFetch.ts`
- `src/components/Fetching/useKatakanaFetch.ts`
- `src/components/SuperMemo/HiraganaScheduler.tsx`
- `src/components/SuperMemo/KatakanaScheduler.tsx`
- `src/components/DeckSelect/DeckSelect.tsx`
- `src/main.tsx` (if adding new routes)

## Estimated Effort
- Phase 1-2: 2 hours (data structures & utilities)
- Phase 3: 2 hours (fetch functions)
- Phase 4: 3 hours (UI components)
- Phase 5: 3 hours (scheduler integration)
- Phase 6: 1 hour (deck selection UI)
- Phase 7: 1 hour (database tracking)
- Phase 8: 2 hours (testing)

**Total**: ~14 hours

