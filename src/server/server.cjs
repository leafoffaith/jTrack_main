//setup express
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;
const fs = require('fs').promises;
const path = require('path');

// server.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'lololxd1',
  host: 'localhost',
  port: 5432,
  database: 'masterdecks',
  table: 'decks'
});

pool.connect((err, client, done) => {
  if (err) throw err;
  console.log('Connected to the PostgreSQL database');
  // Call done() to release the client back to the pool
});


//Middleware
app.use(express.json()); //parse JSON in request body

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
}));

//Router
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/getTSV', async (req, res) => {
  try {
    const jsonArray = await csv({ delimiter: '\t' }).fromFile('jTrack/src/server/pairs.tsv');
    console.log("jsonArray:", jsonArray);
    res.send(jsonArray);
  } catch (error) {
    res.send(error);
  }
});

//List of all decks available
app.get('/api/decks', (req, res) => {
    pool.query('SELECT * FROM masterdecks.decks', (err, result) => {
        if (err) return res.status(500).json({ msg: err });
        res.send(result.rows);
    });
});


//Get a specific deck
app.get('/api/decks/:title', (req, res) => {
  const deckTitle = req.params.title // Make sure this is defined correctly
  pool.query('SELECT * FROM masterdecks.decks WHERE title = $1', [deckTitle], (err, result) => {
      if (err) {
          console.error('Error executing query:', err.message);
          return res.status(500).json({ msg: 'Error executing query' });
      }
      console.log(result.rows);
      res.send(result.rows);
  });
});


app.listen(port, () => console.log(`Server listening on port ${port}!`));
