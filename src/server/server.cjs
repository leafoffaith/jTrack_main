//setup express
const express = require('express');
const app = express();
const cors = require('cors');
const port = 3001;

// server.js
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'lololxd1',
  host: 'localhost',
  port: 5432,
  database: 'masterdecks',
});

pool.connect((err, client, done) => {
  if (err) throw err;
  console.log('Connected to the PostgreSQL database');
  // Call done() to release the client back to the pool
  done();
});


//Middleware
app.use(express.json()); //parse JSON in request body

app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
}));

//Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/decks', (req, res) => {
    pool.query('SELECT * FROM decks', (err, result) => {
        if (err) throw err;
        res.send(result.rows);
    });
});


app.listen(port, () => console.log(`Server listening on port ${port}!`));
