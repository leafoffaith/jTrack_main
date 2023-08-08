import { useState } from 'react';
import { supaClient } from '../Client/supaClient';
import { Auth } from '@supabase/auth-ui-react';
import {
  // Import predefined theme
  ThemeSupa, ThemeMinimal,
} from '@supabase/auth-ui-shared'

export default function Login() {

  //supaClient is the supabase client

  return (
    <div className="row flex flex-center">
        <Auth
            supabaseClient={supaClient}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'red',
                    brandAccent: 'darkred',
                  },
                },
              },
            }}
            providers={['github', 'google', 'facebook']}
          />
      {/* <Auth supabaseClient={supaClient} appearance={{ theme: ThemeSupa }} providers={['github']} /> */}
    </div>
  )
}