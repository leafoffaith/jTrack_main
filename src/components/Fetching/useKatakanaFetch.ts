import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { checkUserHasStudiedRecently, updateUserHasStudied } from "../Client/userStudyHelper";
import { KatakanaItem, CardFetchResult } from "./types";
import { fetchDueCards, fetchNewCards } from "./sharedCardFetch";

const fetchKatakana = async (): Promise<KatakanaItem[]> => {
  // #region agent log
  const fetchStart = Date.now();
  // #endregion
  const { data: katakana, error } = await supaClient
    .from("katakana")
    .select("*")
    .then();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:9',message:'fetchKatakana query result',data:{hasError:!!error,error:error?.message,dataCount:katakana?.length || 0,elapsed:Date.now()-fetchStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(() => { /* ignore */ });
  // #endregion
  if (error) {
    console.warn(error);
    return [];
  }
  
  // Log schema to check actual columns (only on first fetch)
  if (katakana && katakana.length > 0 && !(window as any).__katakanaSchemaLogged) {
    console.log('Katakana table columns:', Object.keys(katakana[0]));
    console.log('Sample katakana row:', katakana[0]);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:19',message:'Katakana schema logged',data:{columns:Object.keys(katakana[0]),sampleRow:katakana[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(() => { /* ignore */ });
    // #endregion
    (window as any).__katakanaSchemaLogged = true;
  }
  
  // #region agent log
  if (katakana && katakana.length > 0) {
    const firstCard = katakana[0];
    fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:25',message:'First katakana card structure',data:{hasFront:'front' in firstCard,frontValue:firstCard.front,hasBack:'back' in firstCard,backValue:firstCard.back,allKeys:Object.keys(firstCard)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(() => { /* ignore */ });
  }
  // #endregion
  
  return katakana || [];
};

// Removed unused function - using fetchUserStudiedCards directly

/**
 * Fetch only due katakana cards
 */
export const fetchDueKatakana = async (userId: string): Promise<CardFetchResult> => {
  const result = await fetchDueCards(userId, 'katakana');
  // Katakana limits due cards to 3 per session (different from hiragana)
  return {
    ...result,
    cards: result.cards.slice(0, 3)
  };
};

/**
 * Fetch only new katakana cards (respects daily limit and 24-hour study check)
 */
export const fetchNewKatakana = async (userId: string): Promise<CardFetchResult> => {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:45',message:'fetchNewKatakana called',data:{userId:userId ? 'present' : 'missing'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(() => { /* ignore */ });
  // #endregion
  if (!userId) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:47',message:'No userId, returning empty',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(() => { /* ignore */ });
    // #endregion
    return { cards: [] };
  }

  // Check if user has studied katakana recently (within 24 hours) - deck-specific check
  // #region agent log
  const checkStart = Date.now();
  // #endregion
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId, 'katakana');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:60',message:'checkUserHasStudiedRecently result (katakana-specific)',data:{hasStudiedRecently,elapsed:Date.now()-checkStart},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(() => { /* ignore */ });
  // #endregion
  await updateUserHasStudied(userId, hasStudiedRecently);

  // If user has studied within 24 hours, no new cards
  if (hasStudiedRecently) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:67',message:'Blocked by 24-hour check (katakana-specific)',data:{hasStudiedRecently},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'H1'})}).catch(() => { /* ignore */ });
    // #endregion
    return {
      cards: [],
      message: "You have finished studying for now! Come back later :)"
    };
  }

  // Fetch directly from katakana table - simpler approach
  // #region agent log
  const fetchStart = Date.now();
  // #endregion
  
  // Fetch all katakana cards
  const allKatakana = await fetchKatakana();
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:95',message:'Fetched all katakana',data:{count:allKatakana.length,firstCard:allKatakana[0] ? Object.keys(allKatakana[0]) : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(() => { /* ignore */ });
  // #endregion
  
  if (!allKatakana || allKatakana.length === 0) {
    return { cards: [] };
  }
  
  // Fetch studied katakana cards
  const { fetchUserStudiedCards } = await import('./sharedCardFetch');
  const studiedCards = await fetchUserStudiedCards(userId, 'katakana');
  const studiedFronts = studiedCards.map((card) => card.front);
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:105',message:'Studied katakana cards',data:{studiedCount:studiedCards.length,studiedFronts},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(() => { /* ignore */ });
  // #endregion
  
  // Filter out already studied cards - katakana table uses 'katakana' column, not 'front'
  const newKatakana = allKatakana.filter((card) => {
    const katakanaChar = (card as any).katakana || card.front;
    return katakanaChar && !studiedFronts.includes(katakanaChar);
  });
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:111',message:'Filtered new katakana',data:{newCount:newKatakana.length,firstNewCard:newKatakana[0] ? Object.keys(newKatakana[0]) : null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(() => { /* ignore */ });
  // #endregion
  
  // Take first 3 new cards and convert to FlashcardItem format
  // Katakana table has 'katakana' and 'romaji' columns, not 'front' and 'back'
  let cardIndex = 0;
  const newCards = newKatakana.slice(0, 3).map((card) => {
    // Katakana table structure: { id, katakana, romaji }
    const front = (card as any).katakana || card.front || '';
    const back = (card as any).romaji || card.back || '';
    // #region agent log
    if (cardIndex === 0) { // Log first conversion
      fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:120',message:'Converting katakana card',data:{cardKeys:Object.keys(card),front,back},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(() => { /* ignore */ });
    }
    cardIndex++;
    // #endregion
    return {
      front,
      back,
      interval: 1,
      repetition: 0,
      efactor: 2.5,
      due_date: dayjs().toISOString(),
    };
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/bb6f6429-d749-4754-adb5-e5c5acc99493',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useKatakanaFetch.ts:130',message:'fetchNewKatakana result',data:{cardCount:newCards.length,firstCard:newCards[0] ? {front:newCards[0].front,back:newCards[0].back} : null,elapsed:Date.now()-fetchStart},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(() => { /* ignore */ });
  // #endregion
  
  return { cards: newCards };
};

/**
 * Fetch available katakana cards (due cards first, then new cards)
 * This maintains backward compatibility with existing code
 */
export const fetchAvailableKatakana = async (
  userId: string
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Check if user has studied katakana recently (within 24 hours) - deck-specific check
  const hasStudiedRecently = await checkUserHasStudiedRecently(userId, 'katakana');
  await updateUserHasStudied(userId, hasStudiedRecently);

  // Priority 1: Check for due cards first
  const dueResult = await fetchDueKatakana(userId);
  if (dueResult.cards.length > 0) {
    return dueResult;
  }

  // Priority 2: No cards are due - check for new cards
  return fetchNewKatakana(userId);
};

// Removed updateKatakana - katakana table columns are read-only/generated
// All updates go to studied_flashcards table only

//create flashcard items from hiragana data with front as the hiragana and back as the romaji that uses the fetch hiragana async function
export const createKatakanaFlashcards = async () => {
  const flashcardItems: FlashcardItem[] = [];
  console.log("fetching hiragana");
  const katakana = await fetchKatakana();
  katakana.forEach((katakanaItem: any) => {
    console.log(katakanaItem);
    const flashcard: FlashcardItem = {
      front: katakanaItem.front,
      back: katakanaItem.back,
      interval: katakanaItem.interval ? katakanaItem.interval : 1,
      repetition: katakanaItem.repetition ? katakanaItem.repetition : 1,
      efactor: katakanaItem.eFactor ? katakanaItem.eFactor : 2.5,
      due_date: katakanaItem.due_date
        ? katakanaItem.due_date
        : dayjs().toISOString(),
    };
    flashcardItems.push(flashcard);
  });
  return flashcardItems;
};
