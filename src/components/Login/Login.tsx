// import { useState } from 'react';
import { supaClient } from '../Client/supaClient';
import { Auth } from '@supabase/auth-ui-react';
import Navbar from '../Navbar/Navbar';
import { signUp, signIn } from './loginLogic';
import { useState } from 'react';
// import './Login.css';

export default function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // const handleLogin = 
    const handleLogin = async () => {
      const { data, error } = await signIn(email, password);
      console.log(email, password);
      if (error) {
        console.error('Error signing in:', error.message);
      } else {
        console.log('User signed in:', data.user);
        console.log(data);
        return data;
      }
    }
    handleLogin()
      .then(() => {
        // window.location.href = '/learn';
        alert('Login successful!');
        // save user session access token from data to cache and set timeout to clear it after 1 hour

      }).catch((error) => {
        console.error('Login failed:', error);
      });
  }
  // const handleSignUp = signUp

  return (
    <div>
      <Navbar />
      <div>
        <h2>Login</h2>
        {/* create inputs */}
        <form onSubmit={handleSubmit}>
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
          <button type="submit">Log In</button>
        </form>
      </div>
    </div >
  )
}