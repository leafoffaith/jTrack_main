import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { BookOpen } from "lucide-react";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supaClient.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
        // Get username from user metadata (stored during registration)
        const usernameFromMetadata = session.user.user_metadata?.username;
        setUsername(usernameFromMetadata || session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    };

    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        // Get username from user metadata
        const usernameFromMetadata = session.user.user_metadata?.username;
        setUsername(usernameFromMetadata || session.user.email || null);
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supaClient.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>JTrack</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Learn
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => void signOut()} size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
