import DeckSelect from "../DeckSelect/DeckSelect";
import fetchDeckList from "../Fetching/fetchDeckList";
import { useQuery } from "react-query";

const Learn = () => {
    
    const results = useQuery('decks', fetchDeckList);

    if(results.isLoading){
        console.log(results.isLoading)
        return (<div>Loading...</div>)
    }

    if(results.isError){
        console.log(results.isError)
        return (<div>There was an error</div>)
    }

    const decks = results?.data;
    console.log(decks)
    return (
        <div>
            {/* Render DeckSelect with fetched 'decks' */}
            <DeckSelect deckList={decks}/>
        </div>
    )
}
export default Learn;