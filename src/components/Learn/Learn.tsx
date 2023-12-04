import DeckSelect from "../DeckSelect/DeckSelect";
import Navbar from "../Navbar/Navbar";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { Outlet, Route, Routes } from "react-router-dom";

const Learn = () => {

    //state deckData
    const [deckData, setDeckData] = useState([]);


    const getDecks = async () => {
        const { data: tempData, error } = await supaClient
            .from('decks')
            .select('title')
        if (error) {
            console.warn(error)
        } else if (tempData) {
            console.log(tempData)
            setDeckData(tempData);
        }
    }

    useEffect(() => {
        getDecks().then(() => {
            console.log(deckData)
        })
            .catch((error) => {
                console.log(error)
            })
    }, [])


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
            </Routes>
        </div>
    )
}
export default Learn;