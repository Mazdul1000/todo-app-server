const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
// const query = require('express/lib/middleware/query');
// require('dotenv').config();
const app = express();
const port = process.env.PORT || 5001;


// Middleware

app.use(cors());
app.use(express.json());





app.get('/', (req, res) => {
  res.send('Running Todo app server')
});


app.listen(port, () => {
  console.log('Listening to port', port)
});