import { FlashcardItem } from "../Flashcard/FlashcardItem";
import dayjs from "dayjs";

interface datedFlashcard extends FlashcardItem {
    dueDate: string;
}

//dueDate can be received as dayjs().toISOString()

export async function useKanjifetch(kanji: string) {
    try{
        const response = await fetch(`https://kanjiapi.dev/v1/kanji/${kanji}`)
        const data = await response.json();
        // console.log(data);
        return data;
    }
    catch(error){
        console.log(error);
    }
}
