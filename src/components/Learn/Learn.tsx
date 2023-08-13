import DeckSelect from "../DeckSelect/DeckSelect";
import fetchDeckList from "../Fetching/fetchDeckList";
import { useQuery } from "react-query";
import Navbar from "../Navbar/Navbar";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";

const Learn = () => {
    
    // const results = useQuery('decks', fetchDeckList);
    const decklist = ["deck1", "deck2", "deck3"];

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
    // console.log(results)

    // if(results.isLoading){
    //     console.log(results.isLoading)
    //     return (<div>Loading...</div>)
    // }

    // if(results.isError){
    //     console.log(results.isError)
    //     return (<div>There was an error</div>)
    // }

    // const decks = results?.data;
    // console.log(decks)
    return (
        <div>
            <div className="container" style={{ padding: '50px 0 100px 0' }}>
              <Navbar />
            </div>
            {/* Render DeckSelect with fetched 'decks' */}
            <DeckSelect deckList={deckData}/>
        </div>
    )
}
export default Learn;