import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { FlashcardItem } from "../Flashcard/FlashcardItem";
import Scheduler from "../SuperMemo/Scheduler";
import { FlashcardTempDB } from "../FlashcardDB/FlashcardTempDB";
import axios from "axios";

const Learn = () => {

    //fetch decks from database from 3001/decks

    const [decks, setDecks] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:3001/api/decks/:id")
        .then((response) => {
            console.log(response.data)
            setDecks(response.data)
        })
        .catch((error) => {
            console.log(error);
        });
    }, []);


    const [visible, setVisible] = useState(false);
    
    // Flashcardb
    const flashcard: FlashcardItem = {
        front: "test",
        back: "back",
        interval: 0,
        repetition: 0,
        efactor: 1.1,
        dueDate: dayjs(Date.now()).toISOString()
    }

    const flashcard2: FlashcardItem = {
        front: "test2",
        back: "back2-thefuture",
        interval: 0,
        repetition: 0,
        efactor: 1.1,
        dueDate: dayjs(Date.now()).toISOString()

    }

    // Array of flashcards
    const flashcards: FlashcardItem[] = [flashcard, flashcard2];

    //Array of flashcards imported from the database
    const flashcardsDB: FlashcardItem[] = FlashcardTempDB;

    return (
        <div>
            {/* Test */}
            {/* Will be replaced by a completely new flashcard component once the reviews are working properly */}
            <h1>Learn</h1>
            {/* Scheduler */}
            {/* Passing an array of flashcards into my scheduler */}
            <Scheduler flashcards={flashcardsDB}/>
            {/* Show answer button */}
            <button onClick={() => setVisible(true)}>Show Answer</button> 
        </div>
    )
}
export default Learn;