import DeckSelect from "../DeckSelect/DeckSelect";
import Navbar from "../Navbar/Navbar";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

const Learn = () => {

    //state deckData
    const [deckData, setDeckData] = useState<any[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const { data: { session } } = await supaClient.auth.getSession();
        setIsAuthenticated(!!session);
        setIsLoading(false);
    }

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
        checkAuth();
        // Listen for auth state changes
        const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            getDecks().catch((error) => {
                console.log(error)
            })
        }
    }, [isAuthenticated])


    if (isLoading) {
        return (
            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                <div className="header-navbar">
                    <Navbar />
                </div>
                <div style={{ width: '100%', padding: '0 1rem' }}>
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div style={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
                <div className="header-navbar">
                    <Navbar />
                </div>
                <div style={{ width: '100%', padding: '0 1rem', textAlign: 'center', marginTop: '2rem' }}>
                    <h2>Please Login first</h2>
                </div>
            </div>
        );
    }

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