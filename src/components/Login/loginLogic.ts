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
