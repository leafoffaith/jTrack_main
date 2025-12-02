import { supaClient } from "../Client/supaClient";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";
import { getNumericUserId } from "../Client/userIdHelper";

interface StudiedFlashcard extends FlashcardItem {
  user_id: number;
  original_deck?: string;
  due_date?: string;
  back?: string | any;
}

//Fetching studied sentence flashcards
const fetchUserSentences = async (
  userId: string
): Promise<StudiedFlashcard[]> => {
  const numericUserId = await getNumericUserId(userId);
  
  const { data: d, error } = await supaClient
    .from("studied_flashcards")
    .select("*")
    .eq("user_id", numericUserId)
    .eq("original_deck", "sentence");

  if (error) {
    console.error("Error fetching data: ", error);
    return [];
  }

  return d || [];
};

export const fetchAvailableSentences = async (
  userId: string,
  allSentences: FlashcardItem[]
): Promise<FlashcardItem[]> => {
  if (!userId) {
    return allSentences.slice(0, 10); // Return first 10 if not authenticated
  }

  //Already studied flashcards
  const studiedFlashcards = await fetchUserSentences(userId);

  if (!allSentences || allSentences.length === 0) {
    console.error("No sentence data provided");
    return [];
  }

  // Get all studied sentence fronts
  const studiedFronts = studiedFlashcards.map((card) => card.front);

  // Get currently due flashcards (prioritize these)
  const dueFlashcards = studiedFlashcards
    .filter((card) => {
      if (!card.due_date) return false;
      const dueDate = new Date(card.due_date);
      const now = new Date();
      return dueDate <= now;
    })
    .map((card) => ({
      front: card.front,
      back: card.back || '',
      interval: card.interval ?? 1,
      repetition: card.repetition ?? 0,
      efactor: card.efactor ?? 2.5,
      due_date: card.due_date,
      options: card.options,
    }));

  // Filter out studied sentences to get new ones
  const newSentences = allSentences
    .filter((s) => !studiedFronts.includes(s.front))
    .slice(0, 10); // Get first 10 new sentences

  // Combine: due flashcards first, then new flashcards
  const availableFlashcards = [
    ...dueFlashcards,
    ...newSentences,
  ];

  return availableFlashcards;
};

