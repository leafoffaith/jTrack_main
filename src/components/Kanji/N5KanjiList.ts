import { useKanjifetch } from "../Fetching/useKanjiFetch"
import { FlashcardItem } from "../Flashcard/FlashcardItem"
import dayjs from "dayjs"

const n5kanjiList = [
'日',
'週',
'月',
'火',
'水',
'木',
'金',
'土',
'年',
'今',
'昨',
'明',
'朝',
'昼',
'夜',
'時',
'分',
'半',
'午',
'前',
'後',
'午',
'間',
'何',
'毎',
'母',
'父',
]


const n4kanjiList = [
'会',
'同',
'事',
'自',
'社',
'発',
'者',
'地',
'業',
'方',
'新',
'場',
'員',
'立',
'開',
'手',
'力',
'問',
'代',
'明',
'動',
]

const n3kanjiList = [
'政',
'民',
'連',
'対',
'部',
'合',
'市',
'内',
'相',
'定',
'回',
'選',
'米',
'実',
'関',
'決',
'全',
'表',
'戦',
'経',
'最',
'現',
'調',
]

let demoKanji = {
    "kanji": "語",
    "stroke_order_diagram": '',
    "gif": '', 
    "svg": ''
}



//for every kanji in the list, create a new kanji object and push it to a new kanji array
//map over array, useKanjiFetch and return data
export const fetchKanjiByLevel = async (level: string) => {
   
    let kanjiList: string[] = [];

    if(level === 'N5'){
        kanjiList = n5kanjiList;
    } else if(level === 'N4'){
        kanjiList = n4kanjiList;
    } else if(level === 'N3'){
        kanjiList = n3kanjiList;
    } else {
        console.log('invalid level');
    }
    const results = [];
    try {
      for (const kanji of kanjiList) {
        const kanjiData = await useKanjifetch(kanji);
        //create flashcard object for each Kanji
        const flashcard: FlashcardItem = {
            front: kanjiData.kanji,
            // Change back to be an object that contains the following:
            /**
             * kanjiData.meanins[0]
             * kanjiData.kun_readings[]
             * kanjiData.on_readings[]
             * kanjiData.name_readings[]
             * kanjiData.stroke_count
             * if readings array empty then display none
             */
            kanjiBack: {
                meaning: kanjiData.meanings[0],
                kun_readings: kanjiData.kun_readings,
                on_readings: kanjiData.on_readings,
                name_readings: kanjiData.name_readings,
                stroke_count: kanjiData.stroke_count,
            },
            interval: 0,
            repetition: 0,
            efactor: 2.5,
            due_date: dayjs().toISOString(),
            };
        results.push(flashcard);
      }
      return results;
    } catch (error) {
      console.log(error);
      return results;
    }
  };
  

