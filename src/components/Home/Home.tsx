//create Home component that will use the navbar component

//silence the error for now
// eslint-disable-next-line
import Navbar from "../Navbar/Navbar";
import { useState } from "react";
import "./Home.css";
import { supaClient } from "../Client/supaClient";
import { useEffect } from "react";
import Login from "../Login/Login";
import JMDict from "../JMDict/JMDict";

const Home = () => {

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

    
    return (

        <div className="home">
         <div className="container" style={{ padding: '50px 0 100px 0' }}>
             {!session ? <Login /> :  <><Navbar /></>}
         </div>
           
        </div>
    );
}

export default Home;

