const fetchDeckList = async ({ queryKey }) => {

    const query = queryKey;
    // Fetch data from API
    const apiRes = await fetch(`http://localhost:3001/api/${query}`);
    
    // If error, throw error
    if (!apiRes.ok) throw new Error(apiRes.statusText);

    return apiRes.json();
}

export default fetchDeckList;