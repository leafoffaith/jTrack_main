/**
 * @author: Shaurya Shekhar Dey s.dey2@ncl.ac.uk
 * @abstract: This file contains the code to read the tatoeba.json file and create flashcards from it
 * @interface: Dict: The dictionary the JSON data is read into
 * @function: readJSON: Reads the JSON data into the dictionary
 * @function: createSentenceFlashcards: Creates 10 flashcards from the dictionary at random
 * @param: none
 */

/** 
 * HOW THE JSON DATA IS STRUCTURED
  - data is an array of length 65868
  - the data is subdivided into arrays that have 4 elements
  - the first element is a number for the japanese sentence we can use to reference while creating the flashcard
  - the second element is a sentence in japanese
  - the third element is another number that is used to reference the english translation of the sentence
  - the fourth element is the english translation of the sentence in the second element
  - so, to access the sentence we can do data[i][1] and to access the english translation we can do data[i][3
  - we can make a multiple choice question by giving the japanese translation 
  - then giving 3 other transations by randomizing i and then doing data[i][3] for the other 3 options
  */

//CODE STARTS HERE

//IMPORTS
import data from './tatoeba.json'
import { FlashcardItem } from "../Flashcard/FlashcardItem"
import dayjs from "dayjs"



//define interface for dictionary
interface Dict {
  [key: string]: string;
}

//init state as a dictionary
const dict: Dict = {} as Dict

/**
 * @returns a promise that resolves when the JSON data is read into the dictionary
 * @throws an error if the JSON data cannot be read into the dictionary
 * @param none
 * @async
 */

const readJSON = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      for (let i = 0; i < data.length; i++) {
        //ts-ignore because typescript doesn't like it when you try to index an array with a string
        dict[data[i][1]] = data[i][3];
      }
      resolve(); // Resolve the promise after the loop completes
    } catch (error) {
      reject(error); // Reject the promise if an error occurs
    }
  });
};

/**
 * @returns an array of 10 flashcards created from the dictionary
 * @throws an error if the JSON data cannot be read into the dictionary
 * @param none
 * @async
 */

//create 10 new flashcards from the dictionary
export const createSentenceFlashcards = async () => {
const flashcards: FlashcardItem[] = []
  try {
    await readJSON();
    //array to store flashcard items
    //create 10 flashcards
  for (let i = 0; i < 10; i++) {
    //get a random key from the dictionary
    const keys = Object.keys(dict)
    const randomKey = keys[Math.floor(Math.random() * keys.length)]
    //create flashcard item
    const flashcard: FlashcardItem = {
      front: randomKey,
      back: dict[randomKey],
      interval: 0,
      repetition: 0,
      efactor: 2.5,
      dueDate: dayjs().toISOString(),
    }
    //add flashcard item to flashcards array
    flashcards.push(flashcard)
  }
    } catch (error) {
      console.log(error) 
  }

  return flashcards;
} 

