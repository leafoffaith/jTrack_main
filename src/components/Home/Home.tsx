import { Outlet, useLocation, Link, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import ScrollToTop from "../ScrollToTop/ScrollToTop";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Brain, Clock, TrendingUp, Layers, ArrowRight, BookOpen } from "lucide-react";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { useAuth } from "../Client/useAuth";
import { getTotalCardCounts, CardCounts } from "../Fetching/useCardCounts";
import { COLOR_PINK, COLOR_BLUE } from "../../constants/colors";

const Home = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHomePage = location.pathname === '/';
    const { userId, isLoading: authLoading } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cardCounts, setCardCounts] = useState<CardCounts>({ newCards: 0, dueCards: 0 });

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

    useEffect(() => {
        if (userId && !authLoading) {
            getTotalCardCounts(userId).then(setCardCounts);
        }
    }, [userId, authLoading]);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <ScrollToTop />

            {isHomePage ? (
                <>
                    {isLoggedIn ? (
                        /* Dashboard Section - WaniKani Style */
                        <section className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Today's Lessons Card - Pink */}
                <Card className="text-white border-0 shadow-wanikani hover:shadow-wanikani-hover transition-shadow" style={{ backgroundColor: COLOR_PINK }}>
                                        <CardContent className="p-6 flex flex-col h-full min-h-[200px]">
                                            <div className="flex items-start justify-between mb-4 flex-1">
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-bold mb-2">Today's Lessons</h2>
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 mb-3">
                                                        <span className="text-lg font-bold">{cardCounts.newCards}</span>
                                                    </div>
                                                    <p className="text-white/90 text-sm">Learn something new.</p>
                                                </div>
                                                <div className="text-6xl opacity-20">
                                                    <BookOpen className="h-16 w-16" />
                                                </div>
                                            </div>
                        <div className="flex gap-2 mt-auto">
                            <Button 
                                onClick={() => navigate('/learn')}
                                className="bg-white hover:bg-white/90 flex-1"
                                style={{ color: COLOR_PINK }}
                            >
                                                    Start Lessons
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                {/* Reviews Card - Blue */}
                <Card className="text-white border-0 shadow-wanikani hover:shadow-wanikani-hover transition-shadow" style={{ backgroundColor: COLOR_BLUE }}>
                                        <CardContent className="p-6 flex flex-col h-full min-h-[200px]">
                                            <div className="flex items-start justify-between mb-4 flex-1">
                                                <div className="flex-1">
                                                    <h2 className="text-2xl font-bold mb-2">Reviews</h2>
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 mb-3">
                                                        <span className="text-lg font-bold">{cardCounts.dueCards}</span>
                                                    </div>
                                                    <p className="text-white/90 text-sm">Do your Reviews to unlock new Lessons.</p>
                                                </div>
                                                <div className="text-6xl opacity-20">
                                                    <Clock className="h-16 w-16" />
                                                </div>
                                            </div>
                        <Button 
                            onClick={() => navigate('/learn')}
                            className="bg-white hover:bg-white/90 w-full mt-auto"
                            style={{ color: COLOR_BLUE }}
                        >
                                                Start Reviews
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Reviews Forecast Card - White */}
                                    <Card className="bg-white border border-gray-200 shadow-wanikani hover:shadow-wanikani-hover transition-shadow">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-5 w-5 text-gray-600" />
                                                    <h3 className="text-lg font-semibold text-gray-900">Reviews Forecast</h3>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {cardCounts.dueCards > 0 ? (
                                                        <>You have <strong>{cardCounts.dueCards} reviews</strong> to do <strong>right now!</strong></>
                                                    ) : (
                                                        <>You don't have any reviews forecast for this week, but keep studying to unlock more!</>
                                                    )}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </section>
                    ) : (
                        /* Hero Section for non-logged in users */
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
                    )}

                    {/* How It Works Section - Only for non-logged in users */}
                    {!isLoggedIn && (
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
                    )}

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
