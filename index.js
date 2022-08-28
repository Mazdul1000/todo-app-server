const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
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
        return res.status(401).send({
            message: 'Access Unauthorized'
        });
    }

    const token = headerAuthor.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            return res.status(403).send({
                message: 'Access forbidden'
            })
        }
        req.decoded = decoded;
        next();
    })
}

// Connect with mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.strweqb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

async function run() {
    try {

        await client.connect();

        const userCollection = client.db('todo-db').collection('users');
        const taskCollection = client.db('todo-db').collection('tasks');

        // adding users to database:
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = {
                email: email
            }
            const options = {
                upsert: true
            };

            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({
                    email: email
                },
                process.env.ACCESS_TOKEN, {
                    expiresIn: '90d'
                })
            res.send({
                result,
                token
            });
        });

        // USER INFO 
        app.get('/user/me', verifyToken, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            const filter = {
                email: email
            }

            if (email === decodedEmail) {
                const userData = await userCollection.findOne(filter);
                res.send(userData)
            }

        })

        // UPDATE USER INFO
        app.put('/user/profile/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body
            const filter = {
                _id: ObjectId(id)
            }

            const updateDoc = {
                $set: body,
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Get task count
        app.get('/task/count', async (req, res) => {
            const email = req.query.email;
            const query = {
                email
            };
            const count = await taskCollection.countDocuments(query);
            res.send({
                count
            });
        })

         // Get task count of completed
         app.get('/task/count/done', async (req, res) => {
            const email = req.query.email;
            const query = {
                email,
                completed : true
            };
            const count = await taskCollection.countDocuments(query);
            res.send({
                count
            });
        })
         // Get task count of Incomplete
         app.get('/task/count/incomplete', async (req, res) => {
            const email = req.query.email;
            const query = {
                email,
                completed : false
            };
            const count = await taskCollection.countDocuments(query);
            res.send({
                count
            });
        })

        // Get tasks
          app.get('/task', verifyToken, async (req, res) => {
            const email = req.query.email;
            const page = parseInt(req.query.page);
            const decodedEmail = req.decoded.email;

            if (email === decodedEmail) {
                const query = {
                    email: email
                }
                const cursor = taskCollection.find(query).sort({
                    $natural: -1
                })
                let tasks;
                if (page) {
                    tasks = await cursor.skip((page - 1) * 5).limit(5).toArray();
                } else {
                    tasks = await cursor.toArray();
                }
                return res.send(tasks)
            } else {
                return res.status(403).send({
                    message: 'Access forbidden'
                })
            }
        })

        // GET TASK WITH ID
        app.get('/task/:id', verifyToken, async (req, res) => {
            const email = req.query.email;
            const id = req.params.id;
            const decodedEmail = req.decoded.email;
            const filter = {
                _id: ObjectId(id)
            }

            if (email === decodedEmail) {
                const result = await taskCollection.findOne(filter);
                res.send(result)
            }

        })

        // GET TASK BY COMPLETED
        app.get('/tasks/completed', verifyToken, async (req, res) => {
            const email = req.query.email;
            const page = parseInt(req.query.page);
            const decodedEmail = req.decoded.email;

            if (email === decodedEmail) {
                const query = {
                    email: email,
                    completed: true
                }
                const cursor = taskCollection.find(query).sort({
                    $natural: -1
                })
                let tasks;
                if (page) {
                    tasks = await cursor.skip((page - 1) * 5).limit(5).toArray();
                } else {
                    tasks = await cursor.toArray();
                }
                return res.send(tasks)
            } else {
                return res.status(403).send({
                    message: 'Access forbidden'
                })
            }
        })

        // GET TASK BY INCOMPLETE
        app.get('/tasks/incomplete', verifyToken, async (req, res) => {
            const email = req.query.email;
            const page = parseInt(req.query.page);
            const decodedEmail = req.decoded.email;

            if (email === decodedEmail) {
                const query = {
                    email: email,
                    completed: false
                }
                const cursor = taskCollection.find(query).sort({
                    $natural: -1
                })
                let tasks;
                if (page) {
                    tasks = await cursor.skip((page - 1) * 5).limit(5).toArray();
                } else {
                    tasks = await cursor.toArray();
                }
                return res.send(tasks)
            } else {
                return res.status(403).send({
                    message: 'Access forbidden'
                })
            }
        })





        // ADD NEW TASK
        app.post('/task', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result)
        })

        // UPDATE TASK AS COMPLETED
        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body
            const filter = {
                _id: ObjectId(id)
            }

            const updateDoc = {
                $set: body,
            };
            const result = await taskCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // DELETE TASK
        app.delete('/task/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            console.dir(email)
            let result;
            if (email === decodedEmail) {
                const query = {
                    _id: ObjectId(id)
                }
                result = await taskCollection.deleteOne(query);
            }

            res.send(result);
        })

    } finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Todo app server')
});


app.listen(port, () => {
    console.log('Listening to port', port)
});