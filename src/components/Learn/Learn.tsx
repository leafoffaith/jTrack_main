import DeckSelect from "../DeckSelect/DeckSelect";
import Navbar from "../Navbar/Navbar";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

const Learn = () => {

    //state deckData
    const [deckData, setDeckData] = useState<any[]>([]);

    const getDecks = async (): Promise<void> => {

        console.log("supaClient:", supaClient);


        const { data: tempData, error } = await supaClient
            .from('decks')
            .select('*')
        if (error) {
            console.warn(error)
            return;
        }
        if (tempData) {
            setDeckData(tempData);
            console.log(tempData, "deck data");
        }
    }

    useEffect(() => {
        getDecks().catch((error) => {
            console.log(error)
        })
    }, [])


    return (
        <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <div className="header-navbar">
                <Navbar />
            </div>
            <div style={{ width: '100%', padding: '0 1rem' }}>
                <DeckSelect deckList={deckData} />
            </div>
            <Routes>
                <Route path="hiragana" element={<div>hiragana</div>} />
                <Route path="katakana" element={<div>katakana</div>} />
                <Route path="kanji" element={<div>kanji</div>} />
            </Routes>
        </div>
    )
}
export default Learn;