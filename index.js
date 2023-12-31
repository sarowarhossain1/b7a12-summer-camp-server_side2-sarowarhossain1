const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5yptyi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
  const usersCollection = client.db('summerDB').collection('users');
  const classCollection = client.db('summerDB').collection('class');
  const reviewCollection = client.db('summerDB').collection('review');
  const bookCollection = client.db('summerDB').collection('book');



    app.post('/jwt', (req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({token})
    })
// users related apis


 app.get('/users', async(req, res) =>{
  const result = await usersCollection.find().toArray();
  res.send(result);
 })

  app.post('/users', async(req, res) =>{
    const user = req.body;
    console.log(user);
    const query = {email: user.email}
    const existingUser = await usersCollection.findOne(query);
    console.log('existingUser', existingUser)
    if(existingUser){
      return res.send({message: 'user already exists'})
    }
    const result = await usersCollection.insertOne(user);
    res.send(result);
  })

  app.patch('/users/admin/:id', async(req, res) =>{
   const id = req.params.id;
   const filter = { _id: new ObjectId(id) };
   const updateDoc = {
    $set: {
      role: 'admin'
    }
   }

 const result = await usersCollection.updateOne(filter, updateDoc);
 res.send(result);

  })

  //class related API
  app.get('/class', async(req, res) =>{
      const result = await classCollection.find().toArray();
      res.send(result);
  })

  // review related API
  app.get('/review', async(req, res) =>{
    const result = await reviewCollection.find().toArray();
    console.log(result)
    res.send(result);
  })


  // book related API
  app.get('/books', async(req, res) => {
   const email = req.query.email;
   console.log(email);
   if(!email){
    res.send([]);
   }
   const query = {email: email};
   const result = await bookCollection.find(query).toArray();
   res.send(result);
  })

  app.post('/books', async (req, res) => {
    const item = req.body;
    console.log(item);
    const result = await bookCollection.insertOne(item);
    res.send(result);

  })

  app.delete('/books/:id', async(req, res) =>{
      const id = req.params.id;
      console.log(id)
      const query = {_id: new ObjectId(id)}
      const result = await bookCollection.deleteOne(query);
      res.send(result);
  })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('summer camp server is running')
})

app.listen(port, ()=> {
  console.log(`summer camp server is running on port: ${port}`)
})
