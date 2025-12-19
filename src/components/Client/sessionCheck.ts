import { supaClient } from "./supaClient";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

export const useSessionCheck = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supaClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).then(() => {
      console.log(session);
    }).catch((error) => {
      console.log(error);
    });

    supaClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session;
};