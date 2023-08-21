import { supaClient } from "../Client/supaClient"
import { FlashcardItem } from "../Flashcard/FlashcardItem"
import dayjs from "dayjs"

const fetchKatakana = async () => {
    const { data: katakana, error } = await supaClient
    .from('katakana')
    .select('*')
    .then() 
    if (error) {
      console.warn(error)
    } else if (katakana) {
    //   console.log('hiragana', hiragana)
      return katakana;
    }
  }

//create flashcard items from hiragana data with front as the hiragana and back as the romaji that uses the fetch hiragana async function
export const createKatakanaFlashcards = async () => {
    const flashcardItems: FlashcardItem[] = [];
    console.log('fetching hiragana')
    const katakana = await fetchKatakana();
    katakana.forEach((katakanaItem: any) => {
        console.log(katakanaItem)
        const flashcard: FlashcardItem = {
            front: katakanaItem.character,
            back: katakanaItem.romaji,
            interval: 0,
            repetition: 0,
            efactor: 2.5,
            dueDate: dayjs().toISOString(),
        }
        flashcardItems.push(flashcard);
    });
    return flashcardItems;
    }

