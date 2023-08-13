//Create and export leaderboard component
import { supaClient } from "../Client/supaClient";
import { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";

//define leaderboard item interface
interface leaderboardItem {
    words_mastered: number,
    kanji_mastered: number,
    study_streak: number,
    primary_user_data?: []
}


const Leaderboard = () => {

    const [leaderboard, setLeaderboard] = useState([]);

       async function getLeaderboard(filter: string) {
        //SAMPLE
        // const { data, error } = await supabase
        // .from('countries')
        // .select()
        
        //if a filter is passed in, use it to sort the leaderboard
        //when the data is fetched, it also fetches foreign table    
        //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const {data: testData, error } = await supaClient.from('User_study_data').select(`
                words_mastered, study_streak, kanji_mastered,
                primary_user_data (user_data_id, name)
            `).order(filter, {ascending: false})

            if (error) {
                console.warn(error)
                } else if (testData) {
                setLeaderboard(testData);
                }
}
    useEffect(() => {       
        getLeaderboard("study_streak").then(() => {
            // console.log("Leaderboard loaded");
        }
        ).catch((error) => {
            console.log(error);
        }
        )
    },[])

    return (
        <div className="leaderboard">
            <div className="container" style={{ padding: '50px 0 100px 0' }}>
              <Navbar />
            </div>
            <h1>Leaderboard</h1>
            <div className="leaderboard__filters">
                <button onClick={() => {
                    // eslint-disable-next-line
                    getLeaderboard("study_streak");
                }
                }>Study Streak</button>
                <button onClick={() => {
                    // eslint-disable-next-line
                    getLeaderboard("words_mastered");
                }
                }>Vocabulary Mastery</button>
                <button onClick={() => {
                    // eslint-disable-next-line
                    getLeaderboard("kanji_mastered");
                }
                }>Total Kanji Mastered</button>
            </div>
            <table className="leaderboard__table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Study Streak</th>
                        <th>Vocabulary Mastery</th>
                        <th>Total Kanji Mastered</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((item: leaderboardItem, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.primary_user_data[0].name}</td>
                                    <td>{item.study_streak}</td>
                                    <td>{item.words_mastered}</td>
                                    <td>{item.kanji_mastered}</td>
                                </tr>
                            )
                    })}
                </tbody>
            </table>
        </div>
    )
}


export default Leaderboard;