import DeckSelect from "../DeckSelect/DeckSelect";
import Navbar from "../Navbar/Navbar";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

const Learn = () => {

    //state deckData
    const [deckData, setDeckData] = useState([]);

    const getDecks = async () => {

        console.log("supaClient:", supaClient);


        const { data: tempData, error } = await supaClient
            .from('decks')
            .select('*')
        if (error) {
            console.warn(error)
        } else if (tempData) {
            console.log(tempData)
            setDeckData(tempData);
        }
    }

    useEffect(() => {
        getDecks().then(() => {
            console.log(deckData, "deck data")
        })
            .catch((error) => {
                console.log(error)
            })
    }, [deckData])


    return (
        <div>
            <div className="header-navbar">
                <Navbar />
            </div>
            {/* Render DeckSelect with fetched 'decks' */}
            <DeckSelect deckList={deckData} />
            <Routes>
                <Route path="hiragana" element={<div>hiragana</div>} />
                <Route path="katakana" element={<div>katakana</div>} />
                <Route path="kanji" element={<div>kanji</div>} />
            </Routes>
        </div>
    )
}
export default Learn;