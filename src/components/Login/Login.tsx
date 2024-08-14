// import { useState } from 'react';
import { supaClient } from '../Client/supaClient';
import { Auth } from '@supabase/auth-ui-react';
import {
  // Import predefined theme
  ThemeSupa
} from '@supabase/auth-ui-shared'

export default function Login() {

  //supaClient is the supabase client

  return (
    <div className="row flex flex-center">
      <Auth
        supabaseClient={supaClient}
        appearance={{
          variables: {
            default: {
              colors: {
                brand: 'red',
                brandAccent: 'darkred',
              },
            },
          },
        }}
        providers={['github', 'google']}
      />
      {/* <Auth supabaseClient={supaClient} appearance={{ theme: ThemeSupa }} providers={['github']} /> */}
    </div>
  )
}