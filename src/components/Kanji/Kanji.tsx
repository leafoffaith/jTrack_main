import Scheduler from "../SuperMemo/Scheduler";
import { n5kanjiList } from "./N5KanjiList";
import useKanjiFetch from "../Fetching/useKanjiFetch";
import { useQueries, useQuery } from "react-query";

const Kanji = (props: any) => {

   
    //create local array of fllashcardItem from 
    const flashcards = n5kanjiList;
    
     //map over useKanjiFetch useQuery and create a flashcardItem for each kanji and push it to the flashcards array
     useQueries(
        flashcards.map((kanji) => {
            return {
                queryKey: ['kanji', kanji],
                queryFn: () => useKanjiFetch(kanji),
                enabled: true,
            };
        })
    );
    

    /**
     * Template of what a flashcardItem looks like
     * const flashcard: Flashcard = {
        front: 'What is the capital of France?',
        back: 'Paris',
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        dueDate: dayjs().toISOString(),
      };*/

    return (
        <>
            <Scheduler flashcards={n5Flashcards}/>
        </>
    )
}

export default Kanji;