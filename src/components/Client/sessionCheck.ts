import { supaClient } from "./supaClient";
import { useEffect, useState } from "react";

const [session, setSession] = useState(null)

    useEffect(() => {
      supaClient.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      }).then(() => {
        console.log(session);
        }).catch((error) => {
            console.log(error);
        })
  
      supaClient.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      })
    }, [])