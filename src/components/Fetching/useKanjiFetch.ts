import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import { getNumericUserId } from "../Client/userIdHelper";

/**
 * Kanji API response interface
 */
interface KanjiApiResponse {
  kanji: string;
  meanings: string[];
  kun_readings: string[];
  on_readings: string[];
  name_readings: string[];
  stroke_count: number;
}

/**
 * Fetches kanji data from kanjiapi.dev API
 * This is used by N5KanjiList.ts to get kanji information
 */
export async function useKanjifetch(kanji: string): Promise<KanjiApiResponse> {
  try {
    const response = await fetch(`https://kanjiapi.dev/v1/kanji/${kanji}`);
    const data = (await response.json()) as KanjiApiResponse;
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

interface StudiedFlashcard {
  user_id: number;
  original_deck?: string;
  due_date?: string;
  front: string;
  back?: string | Record<string, unknown>; // jsonb field
  kanji_meaning?: string;
  on_readings?: string;
  name_readings?: string;
  stroke_count?: string;
  interval?: number;
  repetition?: number;
  efactor?: number;
  kanjiBack?: {
    meaning: [];
    kun_readings: [];
    on_readings: [];
    name_readings: [];
    stroke_count: number;
  };
}

//Fetching studied kanji flashcards
const fetchUserKanji = async (
  userId: string,
  level?: string
): Promise<StudiedFlashcard[]> => {
  const numericUserId = await getNumericUserId(userId);

  const query = supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", numericUserId)
    .eq("original_deck", "kanji");

  if (level) {
    // If we need to filter by level, we might need to add a level column
    // For now, we'll fetch all kanji for the user
  }

  const { data: d, error } = await query;

  if (error) {
    console.error("Error fetching data: ", error);
    return [];
  }

  return (d || []) as StudiedFlashcard[];
};

export const fetchAvailableKanji = async (
  userId: string,
  allKanji: FlashcardItem[]
): Promise<FlashcardItem[]> => {
  if (!userId) {
    return allKanji.slice(0, 10); // Return first 10 if not authenticated
  }

  //Already studied flashcards
  const studiedFlashcards = await fetchUserKanji(userId);

  if (!allKanji || allKanji.length === 0) {
    console.error("No kanji data provided");
    return [];
  }

  // Get all studied kanji characters
  const studiedFronts = studiedFlashcards.map((card) => card.front);

  // Get currently due flashcards (prioritize these)
  const dueFlashcards: FlashcardItem[] = studiedFlashcards
    .filter((card) => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
      const now = new Date();
      return dueDate <= now;
    })
    .map((card) => {
      // Reconstruct kanjiBack from separate columns or use existing
      let kanjiBack = card.kanjiBack;
      if (!kanjiBack && card.kanji_meaning) {
        // Reconstruct from separate columns
        const onReadingsArray = card.on_readings
          ? card.on_readings.split(",").map((r) => r.trim())
          : [];
        const nameReadingsArray = card.name_readings
          ? card.name_readings.split(",").map((r) => r.trim())
          : [];
        kanjiBack = {
          meaning: [card.kanji_meaning] as unknown as [],
          kun_readings: [] as [],
          on_readings: onReadingsArray as unknown as [],
          name_readings: nameReadingsArray as unknown as [],
          stroke_count: parseInt(card.stroke_count || "0", 10),
        };
      }

      // If back is jsonb with kanji data, try to extract it
      if (
        !kanjiBack &&
        typeof card.back === "object" &&
        card.back !== null &&
        !Array.isArray(card.back)
      ) {
        const backData: Record<string, unknown> = card.back;
        if (backData.kanji_meaning || backData.meaning) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const meaningValue: any = backData.meaning || backData.kanji_meaning;
          const meaningArray = Array.isArray(meaningValue)
            ? meaningValue
            : meaningValue
            ? [meaningValue]
            : [];
          kanjiBack = {
            meaning: meaningArray as [],
            kun_readings: (Array.isArray(backData.kun_readings)
              ? backData.kun_readings
              : []) as [],
            on_readings: (Array.isArray(backData.on_readings)
              ? backData.on_readings
              : []) as [],
            name_readings: (Array.isArray(backData.name_readings)
              ? backData.name_readings
              : []) as [],
            stroke_count:
              typeof backData.stroke_count === "number"
                ? backData.stroke_count
                : parseInt(String(backData.stroke_count || "0"), 10),
          };
        }
      }

      return {
        front: card.front,
        back: typeof card.back === "string" ? card.back : undefined,
        kanjiBack: kanjiBack,
        interval: card.interval ?? 1,
        repetition: card.repetition ?? 0,
        efactor: card.efactor ?? 2.5,
        due_date: card.due_date,
      } as FlashcardItem;
    });

  // Filter out studied kanji to get new ones
  const newKanji = allKanji
    .filter((k) => !studiedFronts.includes(k.front))
    .slice(0, 10); // Get first 10 new kanji

  // Combine: due flashcards first, then new flashcards
  const availableFlashcards: FlashcardItem[] = [...dueFlashcards, ...newKanji];

  return availableFlashcards;
};

export const fetchKanjiList = async (level?: string): Promise<FlashcardItem[]> => {
  let query = supaClient.from("kanji").select("*");

  // Filter by JLPT level if provided
  if (level) {
    query = query.eq("jlpt_level", level);
  }

  const { data: kanjiList, error } = await query;

  if (error) {
    console.error("Error fetching kanji list: ", error);
    return [];
  }

  return (kanjiList || []) as FlashcardItem[];
};

/**
 * Wrapper functions matching GenericScheduler pattern
 * These only take userId and return CardFetchResult
 */
import { CardFetchResult } from './types';
import { fetchDueCards } from './sharedCardFetch';
import { getNewCardsShownToday } from '../Client/sessionHelper';

export const fetchAvailableKanjiCards = async (
  userId: string
): Promise<CardFetchResult> => {
  if (!userId) {
    return { cards: [] };
  }

  // Get level from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get('level') || undefined;

  const allKanji = await fetchKanjiList(level);
  const availableCards = await fetchAvailableKanji(userId, allKanji);

  return { cards: availableCards };
};

export const fetchDueKanjiCards = async (
  userId: string
): Promise<CardFetchResult> => {
  return await fetchDueCards(userId, 'kanji');
};

export const fetchNewKanjiCards = async (
  userId: string
): Promise<CardFetchResult> => {
  // Get level from URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const level = urlParams.get('level') || undefined;

  const allKanji = await fetchKanjiList(level);

  const studiedCards = await fetchUserKanji(userId, level);
  const studiedFronts = studiedCards.map(card => card.front);

  // Filter new kanji
  const newKanji = allKanji.filter(k => !studiedFronts.includes(k.front));

  // Get cards shown today
  const newCardsShownToday = getNewCardsShownToday('kanji');
  const dailyLimit = 3;

  // Check daily limit
  if (newCardsShownToday.length >= dailyLimit) {
    return {
      cards: [],
      message: "You have finished studying for now! Come back tomorrow for more cards :)"
    };
  }

  // Filter out cards shown today
  const availableNewKanji = newKanji.filter(k => !newCardsShownToday.includes(k.front));

  // Return up to remaining limit
  const remainingLimit = dailyLimit - newCardsShownToday.length;
  const cardsToShow = availableNewKanji.slice(0, remainingLimit);

  if (cardsToShow.length === 0) {
    return {
      cards: [],
      message: "You have finished studying for now! Come back tomorrow for more cards :)"
    };
  }

  return { cards: cardsToShow };
};
