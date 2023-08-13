import Scheduler from "../SuperMemo/KanjiScheduler";
import { n5kanjiList } from "./N5KanjiList";
import useKanjiFetch from "../Fetching/useKanjiFetch";
import { useQueries, useQuery } from "react-query";
import { Link } from "react-router-dom";

const Kanji = (props: any) => {

   const kArray = ['N5', 'N4', 'N3'];
        
    //function to manage deck click
    const DeckClick = (deck: string) => {
        console.log(deck)
    }

    return (
        <>
         <div>
            <h2>Please choose a deck!</h2>
            {kArray.map((k) => {
                return (
                    <div key={k}>
                        <h3>{k}</h3>
                        <Link to={`/learn/kanji/${k}`}>
                            <button onClick={() => DeckClick(k)}>Select</button>
                        </Link>
                    </div>
                )
            })}
         </div>
        </>
    )
}

export default Kanji