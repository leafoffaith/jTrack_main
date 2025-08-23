import { supaClient } from "../Client/supaClient";

const fetchDeckList = async ({ queryKey }) => {
    
    const query = queryKey;

    const { data: dataDecks, error } = await supaClient
    .from(query)
    .select('title')

    console.log(dataDecks)
    // Fetch data from API
    // const apiRes = await fetch(`http://localhost:3001/api/${query}`);
    
    // If error, throw error
    // if (!apiRes.ok) throw new Error(apiRes.statusText);

    // return apiRes.json();
    return dataDecks;
}

export default fetchDeckList;