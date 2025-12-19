import React, { useEffect, useState } from 'react';
import { useNavigate, Route } from 'react-router-dom';
import { supaClient } from '../Client/supaClient';
import {Learn, Kanji, Scheduler} from '../index.tsx';

// Define the protected routes that should only be accessible to logged-in users
const ProtectedRoutes = () => {
  return (
    <>
      <Route path="/learn" element={<Learn />} />
      <Route path="/learn/kanji" element={<Kanji />} />
      <Route path="/learn/kanji/:title" element={<Scheduler />} />
    </>
  );
};

export const AuthHandler = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const checkSession = async () => {
      const user = supaClient.auth.getUser();
      setIsLoggedIn(user !== null);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>; // Render a loading component while checking the session
  } else if (!isLoggedIn) {
    navigate('/Login'); // Redirect to the login page if the user is not logged in
    return null; // Return null while redirecting to prevent rendering of the protected routes
  } else {
    return <ProtectedRoutes />; // Render the protected routes if the user is logged in
  }
};
