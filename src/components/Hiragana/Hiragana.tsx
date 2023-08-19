import Scheduler from "../SuperMemo/KanjiScheduler";
import { supaClient } from "../Client/supaClient";
import { Link } from "react-router-dom";

const Kanji = (props: any) => {

   
    
    //function to manage deck click
    const DeckClick = (deck: string) => {
        console.log(deck)
    }

    async function getHiragana() {
        let { data: hiragana, error } = await supaClient
        .from('hiragana')
        .select('*')

        

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