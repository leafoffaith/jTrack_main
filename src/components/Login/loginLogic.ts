//this component is handling the logic logic for supabase after the
//deprecation of supabase auth ui

import { supaClient } from "../Client/supaClient";

//user sign up
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supaClient.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

//user sign in
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supaClient.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

//user registration with username
export const register = async (email: string, username: string, password: string) => {
  // First, attempt to sign up the user with username in metadata
  const { data: authData, error: authError } = await supaClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (authError) {
    // Check if error is due to email already existing
    if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
      return { data: null, error: { message: 'Email already exists. Please login instead.' } };
    }
    return { data: null, error: authError };
  }

  // If signup successful, auto-login the user after successful registration
  if (authData.user) {
    const { data: signInData, error: signInError } = await supaClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { data: authData, error: signInError };
    }

    return { data: signInData, error: null };
  }

  return { data: authData, error: null };
};
