const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion} = require('mongodb');
const query = require('express/lib/middleware/query');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5001;


// Middleware

app.use(cors());
app.use(express.json());



// Connect with mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.strweqb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{

        await client.connect();

        const userCollection = client.db('todo-db').collection('users');
        // const taskCollection = client.db('Todo').collection('tasks');

        const user = {name: "Mazdul", email: "mazdddul@mail.com"}
        const result = await userCollection.insertOne(user);



        // Get all the task 
        app.get('/movies', async (req, res) => {
            const query = {};
            const cursor = userCollection.find(query);
            const movies = await cursor.toArray();
            res.send(movies);
      
        });
        
    }

    finally{

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Running Todo app server')
});


app.listen(port, () => {
  console.log('Listening to port', port)
});