// use kanjiapi.dev to fetch kanji for different grades

///GET /vi/kanji/

//https://kanjiapi.dev/v1/kanji/all

const useKanjiFetch = async ({ queryKey }) => {

    const query = queryKey;
    // Fetch data from API
    const apiRes = await fetch(`https://kanjiapi.dev/v1/kanji${query}`);
    
    // If error, throw error
    if (!apiRes.ok) throw new Error(apiRes.statusText);

    return apiRes.json();
}

export default useKanjiFetch;