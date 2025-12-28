import { supaClient } from '../Client/supaClient';
import Navbar from '../Navbar/Navbar';
import ScrollToTop from '../ScrollToTop/ScrollToTop';
import { signIn, register } from './loginLogic';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import jtrackLogo from '../../assets/jtrack-logo.png';

export default function Login() {
  const [searchParams] = useSearchParams();
  const isRegisterMode = searchParams.get("mode") === "register";

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mode, setMode] = useState<"login" | "register">(isRegisterMode ? "register" : "login");
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supaClient.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Redirect to learn page if already logged in
        navigate('/learn');
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        navigate('/learn');
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      handleRegister();
    } else {
      handleLogin();
    }
  }

  const handleLogin = async () => {
    const { data, error } = await signIn(email, password);
    if (error) {
      console.error('Error signing in:', error.message);
      setError(error.message);
    } else {
      console.log('User signed in:', data.user);
      navigate('/learn');
    }
  }

  const handleRegister = async () => {
    const { data, error } = await register(email, username, password);
    if (error) {
      console.error('Error registering:', error.message);
      setError(error.message);
      // If email exists, redirect to login after showing error
      if (error.message.includes('already exists')) {
        setTimeout(() => {
          setMode('login');
          setError('');
        }, 2000);
      }
    } else {
      console.log('User registered and logged in:', data?.user);
      navigate('/learn');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ScrollToTop />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is already logged in, will be redirected
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ScrollToTop />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">Redirecting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ScrollToTop />

      <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img src={jtrackLogo} alt="JTrack Logo" className="h-12 w-12 object-contain" />
              </div>
            </div>
            <CardTitle className="text-2xl">{mode === "login" ? "Welcome Back" : "Create Your Account"}</CardTitle>
            <CardDescription>
              {mode === "login"
                ? "Enter your credentials to access your account"
                : "Start your language learning journey today"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError('');
                  setEmail('');
                  setPassword('');
                  setUsername('');
                }}
                className="text-primary hover:underline"
              >
                {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
