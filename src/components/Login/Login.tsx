// import { useState } from 'react';
import { supaClient } from '../Client/supaClient';
import { Auth } from '@supabase/auth-ui-react';
import Navbar from '../Navbar/Navbar';
import { signUp, signIn, register } from './loginLogic';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import './Login.css';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
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

    if (isRegistering) {
      handleRegister();
    } else {
      handleLogin();
    }
  }

  const handleLogin = async () => {
    const { data, error } = await signIn(email, password);
    console.log(email, password);
    if (error) {
      console.error('Error signing in:', error.message);
      setError(error.message);
    } else {
      console.log('User signed in:', data.user);
      console.log(data);
      alert('Login successful!');
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
          setIsRegistering(false);
          setError('');
        }, 2000);
      }
    } else {
      console.log('User registered and logged in:', data?.user);
      alert('Registration successful!');
      navigate('/learn');
    }
  }

  if (isLoading) {
    return (
      <div>
        <Navbar />
        <div>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is already logged in, will be redirected
    return (
      <div>
        <Navbar />
        <div>Redirecting...</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        {/* create inputs */}
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegistering ? 'Register' : 'Log In'}</button>
        </form>
        <button 
          type="button" 
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setEmail('');
            setPassword('');
            setUsername('');
          }}
          style={{ marginTop: '1rem' }}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </div>
    </div >
  )
}