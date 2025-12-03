# Unit Tests

This directory contains unit tests for the flashcard application components.

## Test Structure

### 1. Flashcard Creation Tests (`flashcardCreation.test.ts`)
Tests for flashcard creation functions:
- `createHiraganaFlashcards()` - Creates flashcards from hiragana data
- `createKatakanaFlashcards()` - Creates flashcards from katakana data
- Validates correct structure, default values, and data types

### 2. Available Flashcards Tests (`availableFlashcards.test.ts`)
Tests for available flashcard fetching logic:
- Priority 1: Due cards (past due_date) - shows only these, max 3
- Priority 2: New cards when no cards are due and user hasn't studied in 24 hours
- Priority 3: Completion message when user has studied recently and no cards are due
- Validates card limits and prioritization logic

### 3. Database Connection Tests (`databaseConnection.test.ts`)
Tests for database helper functions:
- `getNumericUserId()` - Converts UUID to numeric user ID
- `checkUserHasStudiedRecently()` - Checks if user studied within 24 hours
- `updateUserHasStudied()` - Updates user study status
- `getUserHasStudied()` - Gets user study status
- Validates error handling and edge cases

### 4. Studied Flashcard Format Tests (`studiedFlashcardFormat.test.ts`)
Tests for studied flashcard data format validation:
- Validates `StudiedFlashcardData` interface structure
- Checks required fields and data types
- Validates date formats (ISO strings)
- Validates SuperMemo algorithm constraints (efactor range, etc.)
- Tests conversion from `FlashcardItem` to `StudiedFlashcardData`

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test flashcardCreation.test.ts
```

## Test Setup

Tests use:
- **Vitest** - Testing framework (Vite-native)
- **@testing-library/react** - React component testing utilities
- **jsdom** - DOM environment for testing
- **@testing-library/jest-dom** - Additional matchers

## Mocking

- Supabase client is mocked in test files
- Database queries are mocked to return test data
- Helper functions are mocked where needed

## Writing New Tests

When adding new tests:
1. Create test file in `src/test/` directory
2. Use `describe` blocks to group related tests
3. Use `it` or `test` for individual test cases
4. Mock external dependencies (Supabase, etc.)
5. Use descriptive test names
6. Follow existing test patterns

## Example Test Structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Component Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should do something', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

