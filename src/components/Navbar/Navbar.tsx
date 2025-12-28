import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import { supaClient } from "../Client/supaClient";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { COLOR_PINK } from "../../constants/colors";

const Navbar = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supaClient.auth.getSession();
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    fetchUserData();

    // Listen for auth state changes
    const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
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

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-gray-900 hover:text-gray-700 transition-colors">
              <BookOpen className="h-6 w-6" style={{ color: COLOR_PINK }} />
              <span className="text-gray-900">JTrack</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`relative px-4 py-2 text-sm font-medium transition-all ${isActive('/') && location.pathname === '/'
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Home
                {(isActive('/') && location.pathname === '/') ? (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLOR_PINK }}></span>
                ) : (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 hover:opacity-100 transition-opacity" style={{ backgroundColor: COLOR_PINK }}></span>
                )}
              </Link>
              <Link
                to="/learn"
                className={`relative px-4 py-2 text-sm font-medium transition-all ${isActive('/learn')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Learn
                {isActive('/learn') ? (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: COLOR_PINK }}></span>
                ) : (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 hover:opacity-100 transition-opacity" style={{ backgroundColor: COLOR_PINK }}></span>
                )}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button className="bg-black hover:bg-gray-900 text-white" size="sm">
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
