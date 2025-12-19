import DeckSelect from "../DeckSelect/DeckSelect";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

interface Deck {
    deck_id: number;
    title: string;
}

const Learn = () => {
    const [deckData, setDeckData] = useState<Deck[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        const { data: { session } } = await supaClient.auth.getSession();
        setIsAuthenticated(!!session);
        setIsLoading(false);
    }

    const getDecks = async (): Promise<void> => {
        const { data: tempData, error } = await supaClient
            .from('decks')
            .select('*')
        if (error) {
            console.warn(error)
            return;
        }
        if (tempData) {
            setDeckData(tempData);
        }
    }

    useEffect(() => {
        void checkAuth();
        const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            void getDecks().catch((error) => {
                console.log(error)
            })
        }
    }, [isAuthenticated])

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Please Login First</CardTitle>
                        <CardDescription>You need to be logged in to access your decks and start learning.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/login">
                            <Button className="w-full" size="lg">
                                Go to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
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