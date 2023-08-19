import { supaClient } from "../Client/supaClient"
import { FlashcardItem } from "../Flashcard/FlashcardItem"
import dayjs from "dayjs"

const fetchHiragana = async () => {
    const { data: hiragana, error } = await supaClient
    .from('hiragana')
    .select('*')
    .then() 
    if (error) {
      console.warn(error)
    } else if (hiragana) {
    //   console.log('hiragana', hiragana)
      return hiragana;
    }
  }

//create flashcard items from hiragana data with front as the hiragana and back as the romaji that uses the fetch hiragana async function
export const createHiraganaFlashcards = async () => {
    const flashcardItems: FlashcardItem[] = [];
    console.log('fetching hiragana')
    const hiragana = await fetchHiragana();
    hiragana.forEach((hiraganaItem: any) => {
        console.log(hiraganaItem)
        const flashcard: FlashcardItem = {
            front: hiraganaItem.character,
            back: hiraganaItem.romaji,
            interval: 0,
            repetition: 0,
            efactor: 2.5,
            dueDate: dayjs().toISOString(),
        }
        flashcardItems.push(flashcard);
    });
    return flashcardItems;
    }

