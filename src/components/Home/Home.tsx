import { Outlet, useLocation, Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Brain, Clock, TrendingUp, Layers } from "lucide-react";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";

const Home = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supaClient.auth.getSession();
            setIsLoggedIn(!!session?.user);
        };
        checkAuth();

        const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session?.user);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <ScrollToTop />

            {isHomePage ? (
                <>
                    {/* Hero Section */}
                    <section className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
                        <div className="max-w-4xl mx-auto text-center space-y-8">
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance">
                                    Master Japanese with <span className="text-primary">Spaced Repetition</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                                    Learn faster and remember longer with scientifically-proven spaced repetition. Our algorithm, based on SuperMemo 2,
                                    schedules reviews right before you forget, optimizing your study time for maximum retention.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link to={isLoggedIn ? "/learn" : "/login"}>
                                    <Button size="lg" className="text-base px-8">
                                        Start Learning
                                    </Button>
                                </Link>
                                <a href="#how-it-works">
                                    <Button size="lg" variant="outline" className="text-base px-8 bg-transparent">
                                        Learn How It Works
                                    </Button>
                                </a>
                            </div>

                            {/* Visual Preview */}
                            <div className="relative mt-16 perspective-1000">
                                <div className="relative mx-auto max-w-md">
                                    {/* Stacked card preview */}
                                    <div className="relative">
                                        <Card className="absolute -rotate-6 scale-95 opacity-30 blur-sm">
                                            <CardContent className="h-64" />
                                        </Card>
                                        <Card className="absolute -rotate-3 scale-97 opacity-50 blur-[2px]">
                                            <CardContent className="h-64" />
                                        </Card>
                                        <Card className="relative shadow-2xl">
                                            <CardContent className="h-64 flex flex-col items-center justify-center gap-6">
                                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Layers className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="text-6xl font-bold">あ</p>
                                                    <p className="text-muted-foreground">Hiragana • a</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How It Works Section */}
                    <section id="how-it-works" className="bg-muted/30 py-20 md:py-32">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="max-w-4xl mx-auto space-y-16">
                                <div className="text-center space-y-4">
                                    <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                        Three simple steps to efficient learning
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <Card>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Brain className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold">1. Choose Your Deck</h3>
                                            <p className="text-muted-foreground">
                                                Select from Hiragana, Katakana, or Kanji decks tailored to your learning level.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Clock className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold">2. Study & Review</h3>
                                            <p className="text-muted-foreground">
                                                Learn new cards and review due cards. Rate how well you remembered each one.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-semibold">3. Optimize Retention</h3>
                                            <p className="text-muted-foreground">
                                                Our algorithm schedules future reviews at the optimal time for long-term memory.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* SuperMemo 2 Explanation */}
                                <Card className="bg-card">
                                    <CardContent className="pt-6 space-y-4">
                                        <h3 className="text-2xl font-semibold">The Science: SuperMemo 2</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Spaced repetition leverages the psychological spacing effect: information is better retained when
                                            reviews are distributed over time. SuperMemo 2 (SM-2) is an algorithm that calculates the optimal
                                            interval between reviews based on how easily you recalled the information. When you rate a flashcard
                                            as "Easy," the next review is scheduled further in the future. If you struggle, the interval shortens.
                                            This adaptive approach ensures you focus on what you need to practice most, maximizing efficiency and
                                            retention.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t py-8">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
                            <p>© 2025 JTrack. Built for language learners.</p>
                        </div>
                    </footer>
                </>
            ) : (
                <Outlet />
            )}
        </div>
    );
};

export default Home;
