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

// Verify Token
// Token verification:
async function verifyToken(req, res, next) {
    const headerAuthor = req.headers.authorization;
    if (!headerAuthor) {
        return res.status(401).send({ message: 'Access Unauthorized' });
    }

    const token = headerAuthor.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'Access forbidden' })
        }
        req.decoded = decoded;
        next();
    })
}

// Connect with mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.strweqb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{

        await client.connect();

        const userCollection = client.db('todo-db').collection('users');
        // const taskCollection = client.db('Todo').collection('tasks');

      


           // adding users to database:
           app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true };

            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email },
                process.env.ACCESS_TOKEN, { expiresIn: '90d' })
            res.send({ result, token });
        });


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