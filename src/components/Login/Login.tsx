// import { useState } from 'react';
import { supaClient } from '../Client/supaClient';
import { Auth } from '@supabase/auth-ui-react';
import Navbar from '../Navbar/Navbar';
// import './Login.css';

export default function Login() {
  return (
    <div>
      <Navbar />
      <div style={{
        marginTop: '120px',
        marginLeft: 'auto',
        marginRight: 'auto',
        backgroundColor: '#f9e9de',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '350px',
      }}>
        <Auth
          supabaseClient={supaClient}
          appearance={{
            variables: {
              default: {
                colors: {
                  brand: '#3e5172',
                  brandAccent: '#cc6c5c',
                },
              },
            },
            style: {
              button: {
                backgroundColor: '#3e5172',
                color: 'white',
                borderRadius: '4px',
                padding: '0.5rem 1rem',
              },
              input: {
                backgroundColor: 'white',
                borderRadius: '4px',
                border: '1px solid #3e5172',
                padding: '0.75rem',
                fontSize: '1rem',
              },
              label: {
                // color: '#3e5172',
                opacity: 0.7,
              },
            },
          }}
          providers={['github', 'google']}
        />
      </div>
    </div>
  )
}