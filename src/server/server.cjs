console.log('[SERVER] Starting server initialization...');

//setup express
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;
const fs = require('fs').promises;
const path = require('path');

console.log('[SERVER] Express app created');

//init kuromoji
console.log('[SERVER] Loading Kuromoji dependencies...');
const KuromojiAnalyzer = require("kuroshiro-analyzer-kuromoji");
const Kuroshiro = require("kuroshiro");
console.log('[SERVER] Kuromoji dependencies loaded successfully');

// server.js
// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   password: 'lololxd1',
//   host: 'localhost',
//   port: 5432,
//   database: 'masterdecks',
//   table: 'decks'
// });

// pool.connect((err, client, done) => {
//   if (err) throw err;
//   console.log('Connected to the PostgreSQL database');
//   // Call done() to release the client back to the pool
// });

//Middleware
console.log('[SERVER] Setting up middleware...');
app.use(express.json()); //parse JSON in request body
console.log('[SERVER] JSON parser middleware added');

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
}));
console.log('[SERVER] CORS middleware added');

//get the text query param and convert the text to hiragana with furigana for kanji
app.get('/api/kuroshiro', async (req, res) => {
  console.log('[API] /api/kuroshiro endpoint called');
  console.log('[API] Request query:', req.query);

  const inputText = req.query.text; // Extract the 'text' query parameter from the request
  if (!inputText) {
    console.log('[API] Missing text parameter, returning 400');
    return res.status(400).send("Missing 'text' query parameter.");
  }

  console.log('[API] Input text received:', inputText);
  console.log('[API] Creating Kuroshiro instance...');
  const kuroshiro = new Kuroshiro();

  try {
    console.log('[API] Initializing Kuromoji analyzer (this may take a moment)...');
    const startInit = Date.now();
    await kuroshiro.init(new KuromojiAnalyzer());
    const initTime = Date.now() - startInit;
    console.log(`[API] Kuromoji analyzer initialized successfully in ${initTime}ms`);

    console.log('[API] Converting text to hiragana with furigana...');
    const startConvert = Date.now();
    const convertedText = await kuroshiro.convert(inputText, { to: "hiragana", mode: "furigana" });
    const convertTime = Date.now() - startConvert;
    console.log(`[API] Conversion completed in ${convertTime}ms`);
    console.log('[API] Converted text:', convertedText);

    res.send(convertedText);
    console.log('[API] Response sent successfully');
  } catch (err) {
    console.error('[API] Error occurred:', err);
    console.error('[API] Error stack:', err.stack);
    res.status(500).send("An error occurred while processing the request.");
  }
});

// Router
app.get('/', (req, res) => {
  console.log('[API] Root endpoint called');
  res.send('Hello World!');
});
console.log('[SERVER] Routes registered');

// app.get('/getTSV', async (req, res) => {
//   try {
//     const jsonArray = await csv({ delimiter: '\t' }).fromFile('jTrack/src/server/pairs.tsv');
//     console.log("jsonArray:", jsonArray);
//     res.send(jsonArray);
//   } catch (error) {
//     res.send(error);
//   }
// });

//List of all decks available
// app.get('/api/decks', (req, res) => {
//     pool.query('SELECT * FROM masterdecks.decks', (err, result) => {
//         if (err) return res.status(500).json({ msg: err });
//         res.send(result.rows);
//     });
// });


// //Get a specific deck
// app.get('/api/decks/:title', (req, res) => {
//   const deckTitle = req.params.title // Make sure this is defined correctly
//   pool.query('SELECT * FROM masterdecks.decks WHERE title = $1', [deckTitle], (err, result) => {
//       if (err) {
//           console.error('Error executing query:', err.message);
//           return res.status(500).json({ msg: 'Error executing query' });
//       }
//       console.log(result.rows);
//       res.send(result.rows);
//   });
// });


console.log('[SERVER] Starting server on port', port);
app.listen(port, () => {
  console.log(`[SERVER] ✅ Server listening on port ${port}!`);
  console.log(`[SERVER] Server is ready to accept connections`);
});
