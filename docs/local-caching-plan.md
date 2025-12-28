# Local Progress Caching Implementation Plan

## Overview

Implement local caching to reduce database fetches and improve app performance by storing flashcard progress and deck metadata locally.

## Goals

1. Reduce database queries for frequently accessed data
2. Improve app load times and responsiveness
3. Provide offline-capable progress tracking
4. Sync local cache with database when online

## Caching Strategy

### What to Cache

1. **User's studied flashcards** - Most frequently accessed
2. **Deck card counts** (new/due)
3. **User profile data**
4. **Session data** (new cards shown today, last session date)

### Cache Storage Options

#### Option 1: IndexedDB (Recommended)

**Pros:**

- Large storage capacity (50MB+)
- Asynchronous operations
- Structured data storage
- Good for complex queries

**Cons:**

- More complex API
- Requires wrapper library (e.g., Dexie.js)

#### Option 2: LocalStorage

**Pros:**

- Simple API
- Synchronous (easier to use)
- Good browser support

**Cons:**

- Limited storage (5-10MB)
- Only stores strings
- Synchronous operations can block UI

#### Option 3: React Query Cache (Current)

**Pros:**

- Already implemented
- Automatic background refetching
- Built-in stale-while-revalidate

**Cons:**

- In-memory only (lost on page refresh)
- Not persistent across sessions

### Recommended Approach: Hybrid

- **React Query** for in-memory caching during session
- **IndexedDB** for persistent storage across sessions
- **LocalStorage** for simple session tracking (already implemented)

## Implementation Plan

### Phase 1: Setup IndexedDB with Dexie.js

#### 1.1 Install Dexie

```bash
npm install dexie
```

#### 1.2 Create Database Schema

**File**: `src/lib/db.ts` (NEW)

```typescript
import Dexie, { Table } from "dexie";

export interface CachedStudiedFlashcard {
  id?: number;
  user_id: number;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
  last_studied: string;
  cached_at: number; // Timestamp
}

export interface CachedDeckMetadata {
  id?: number;
  user_id: number;
  deck_type: string;
  new_cards: number;
  due_cards: number;
  cached_at: number;
}

export interface CachedUserProfile {
  id?: number;
  user_id: number;
  username: string;
  email: string;
  avatar_url?: string;
  cached_at: number;
}

class JTrackDatabase extends Dexie {
  studiedFlashcards!: Table<CachedStudiedFlashcard>;
  deckMetadata!: Table<CachedDeckMetadata>;
  userProfiles!: Table<CachedUserProfile>;

  constructor() {
    super("JTrackDB");
    this.version(1).stores({
      studiedFlashcards:
        "++id, user_id, original_deck, front, due_date, cached_at",
      deckMetadata: "++id, user_id, deck_type, cached_at",
      userProfiles: "++id, user_id, cached_at",
    });
  }
}

export const db = new JTrackDatabase();
```

### Phase 2: Create Cache Service

#### 2.1 Cache Manager Utility

**File**: `src/lib/cacheManager.ts` (NEW)

```typescript
import { db } from "./db";
import dayjs from "dayjs";

const CACHE_DURATION = {
  STUDIED_FLASHCARDS: 5 * 60 * 1000, // 5 minutes
  DECK_METADATA: 2 * 60 * 1000, // 2 minutes
  USER_PROFILE: 30 * 60 * 1000, // 30 minutes
};

export class CacheManager {
  /**
   * Check if cached data is still valid
   */
  static isCacheValid(cachedAt: number, duration: number): boolean {
    return Date.now() - cachedAt < duration;
  }

  /**
   * Get studied flashcards from cache or database
   */
  static async getStudiedFlashcards(
    userId: number,
    deckType: string,
    forceRefresh = false
  ) {
    if (!forceRefresh) {
      // Try to get from cache first
      const cached = await db.studiedFlashcards
        .where({ user_id: userId, original_deck: deckType })
        .toArray();

      if (
        cached.length > 0 &&
        this.isCacheValid(
          cached[0].cached_at,
          CACHE_DURATION.STUDIED_FLASHCARDS
        )
      ) {
        console.log("📦 Using cached studied flashcards");
        return cached;
      }
    }

    // Cache miss or expired - fetch from database
    console.log("🌐 Fetching studied flashcards from database");
    // Fetch logic here (move from existing fetch functions)
    // Then cache the results
  }

  /**
   * Update studied flashcards cache
   */
  static async updateStudiedFlashcards(
    userId: number,
    deckType: string,
    flashcards: any[]
  ) {
    const cachedFlashcards = flashcards.map((card) => ({
      ...card,
      user_id: userId,
      original_deck: deckType,
      cached_at: Date.now(),
    }));

    // Clear old cache for this user/deck
    await db.studiedFlashcards
      .where({ user_id: userId, original_deck: deckType })
      .delete();

    // Add new cache
    await db.studiedFlashcards.bulkAdd(cachedFlashcards);
  }

  /**
   * Get deck metadata from cache or database
   */
  static async getDeckMetadata(
    userId: number,
    deckType: string,
    forceRefresh = false
  ) {
    if (!forceRefresh) {
      const cached = await db.deckMetadata
        .where({ user_id: userId, deck_type: deckType })
        .first();

      if (
        cached &&
        this.isCacheValid(cached.cached_at, CACHE_DURATION.DECK_METADATA)
      ) {
        console.log("📦 Using cached deck metadata");
        return cached;
      }
    }

    console.log("🌐 Fetching deck metadata from database");
    // Fetch logic here
  }

  /**
   * Clear all cache for a user (on logout)
   */
  static async clearUserCache(userId: number) {
    await db.studiedFlashcards.where({ user_id: userId }).delete();
    await db.deckMetadata.where({ user_id: userId }).delete();
    await db.userProfiles.where({ user_id: userId }).delete();
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache() {
    const now = Date.now();

    await db.studiedFlashcards
      .where("cached_at")
      .below(now - CACHE_DURATION.STUDIED_FLASHCARDS)
      .delete();

    await db.deckMetadata
      .where("cached_at")
      .below(now - CACHE_DURATION.DECK_METADATA)
      .delete();

    await db.userProfiles
      .where("cached_at")
      .below(now - CACHE_DURATION.USER_PROFILE)
      .delete();
  }
}
```

### Phase 3: Integrate with Existing Fetch Functions

#### 3.1 Update Hiragana Fetch

**File**: `src/components/Fetching/useHiraganaFetch.ts`

```typescript
import { CacheManager } from "../../lib/cacheManager";

export const fetchUserStudiedHiragana = async (
  userId: string
): Promise<StudiedFlashcard[]> => {
  const numericUserId = await getNumericUserId(userId);

  // Try cache first
  const cached = await CacheManager.getStudiedFlashcards(
    numericUserId,
    "hiragana"
  );
  if (cached) return cached;

  // Fetch from database
  const { data, error } = await supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", numericUserId)
    .eq("original_deck", "hiragana");

  if (error) {
    console.error("Error fetching studied hiragana cards:", error);
    return [];
  }

  // Update cache
  await CacheManager.updateStudiedFlashcards(
    numericUserId,
    "hiragana",
    data || []
  );

  return data || [];
};
```

#### 3.2 Update Card Counts

**File**: `src/components/Fetching/useCardCounts.ts`

```typescript
export const getDeckCardCounts = async (
  userId: string,
  deckType: string
): Promise<CardCounts> => {
  const numericUserId = await getNumericUserId(userId);

  // Try cache first
  const cached = await CacheManager.getDeckMetadata(numericUserId, deckType);
  if (cached) {
    return { newCards: cached.new_cards, dueCards: cached.due_cards };
  }

  // Fetch from database (existing logic)
  // ...

  // Update cache
  await CacheManager.updateDeckMetadata(numericUserId, deckType, {
    newCards,
    dueCards,
  });

  return { newCards, dueCards };
};
```

### Phase 4: Optimistic Updates

#### 4.1 Update Flashcard Practice

**File**: `src/components/SuperMemo/HiraganaScheduler.tsx`

```typescript
const practice = async (grade: SuperMemoGrade): Promise<void> => {
  const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);

  // 1. Update UI immediately (optimistic)
  setHiraganaData((prev) =>
    prev.map((card) =>
      card.front === updatedFlashcard.front ? updatedFlashcard : card
    )
  );

  // 2. Update local cache
  await CacheManager.updateSingleFlashcard(
    numericUserId,
    "hiragana",
    updatedFlashcard
  );

  // 3. Sync to database (background)
  try {
    await supaClient.from("studied_flashcards").upsert(studiedData);
  } catch (error) {
    console.error("Error syncing to database:", error);
    // Optionally: Add to sync queue for retry
  }
};
```

### Phase 5: Background Sync

#### 5.1 Sync Queue for Offline Support

**File**: `src/lib/syncQueue.ts` (NEW)

```typescript
interface SyncTask {
  id: string;
  type: "upsert" | "delete";
  table: string;
  data: any;
  timestamp: number;
}

class SyncQueue {
  private queue: SyncTask[] = [];

  async addTask(task: Omit<SyncTask, "id" | "timestamp">) {
    const syncTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    this.queue.push(syncTask);
    localStorage.setItem("syncQueue", JSON.stringify(this.queue));

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.processTasks();
    }
  }

  async processTasks() {
    while (this.queue.length > 0 && navigator.onLine) {
      const task = this.queue[0];

      try {
        await this.executeTask(task);
        this.queue.shift();
        localStorage.setItem("syncQueue", JSON.stringify(this.queue));
      } catch (error) {
        console.error("Sync failed:", error);
        break; // Stop processing on error
      }
    }
  }

  private async executeTask(task: SyncTask) {
    // Execute database operation
    if (task.type === "upsert") {
      await supaClient.from(task.table).upsert(task.data);
    } else if (task.type === "delete") {
      await supaClient.from(task.table).delete().eq("id", task.data.id);
    }
  }
}

export const syncQueue = new SyncQueue();

// Listen for online event
window.addEventListener("online", () => {
  syncQueue.processTasks();
});
```

### Phase 6: Cache Invalidation

#### 6.1 Invalidate on Auth Changes

**File**: `src/App.tsx`

```typescript
useEffect(() => {
  supaClient.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT") {
      // Clear cache on logout
      const numericUserId = await getNumericUserId(session?.user?.id);
      await CacheManager.clearUserCache(numericUserId);
    }
  });
}, []);
```

#### 6.2 Periodic Cache Cleanup

**File**: `src/App.tsx`

```typescript
useEffect(() => {
  // Clear expired cache every 5 minutes
  const interval = setInterval(() => {
    CacheManager.clearExpiredCache();
  }, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

### Phase 7: Cache Status Indicator

#### 7.1 Add Cache Status to UI

**File**: `src/components/Navbar/Navbar.tsx`

```typescript
const [cacheStatus, setCacheStatus] = useState<
  "synced" | "syncing" | "offline"
>("synced");

// Show indicator
{
  cacheStatus === "offline" && (
    <div className="text-xs text-yellow-600">
      Offline mode - changes will sync when online
    </div>
  );
}
```

## Testing Checklist

- [ ] Cache correctly stores and retrieves studied flashcards
- [ ] Cache correctly stores and retrieves deck metadata
- [ ] Cache expires after configured duration
- [ ] Optimistic updates work correctly
- [ ] Database syncs in background
- [ ] Offline mode works (changes queued)
- [ ] Online sync processes queued changes
- [ ] Cache clears on logout
- [ ] Expired cache is cleaned up periodically
- [ ] Performance improvement is measurable

## Performance Metrics

### Before Caching

- Initial load: ~2-3 seconds
- Deck selection load: ~1-2 seconds
- Flashcard fetch: ~500-1000ms

### Expected After Caching

- Initial load: ~500ms (from cache)
- Deck selection load: ~200ms (from cache)
- Flashcard fetch: ~100ms (from cache)

## Migration Strategy

1. **Phase 1**: Implement caching alongside existing fetches (no breaking changes)
2. **Phase 2**: Test with small user group
3. **Phase 3**: Roll out to all users
4. **Phase 4**: Monitor performance and adjust cache durations

## Future Enhancements

1. **Service Worker**: Full offline support with background sync
2. **Predictive Prefetching**: Preload likely next cards
3. **Compression**: Compress cached data to save space
4. **Smart Cache**: Machine learning to predict which data to cache
5. **Multi-device Sync**: Sync cache across devices

## Estimated Effort

- Phase 1: 2 hours (setup IndexedDB)
- Phase 2: 3 hours (cache manager)
- Phase 3: 3 hours (integrate with fetches)
- Phase 4: 2 hours (optimistic updates)
- Phase 5: 3 hours (background sync)
- Phase 6: 1 hour (cache invalidation)
- Phase 7: 1 hour (UI indicator)
- Testing: 2 hours

**Total**: ~17 hours
