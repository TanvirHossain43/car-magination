const express = require('express')
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000


// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5lehpdk.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const toysCollection = client.db('toys').collection('car-toys')

        app.get('/alltoys', async (req, res) => {
            // get my toys through email
            console.log(req.query.email)
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toysCollection.find(query).toArray()
            res.send(result)

        })

        app.get('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })




        // post toy

        app.post('/alltoys', async (req, res) => {
            const newToy = req.body;
            const result = await toysCollection.insertOne(newToy);
            res.send(result)

        })

        // update toys

        app.patch('/alltoys/:id',async(req,res)=>{
            const id =req.params.id;
            const updatedAddedToys= req.body;
            const filter = {_id:new ObjectId(id)}
            const updatedToys = {
                $set:{
                    status:updatedAddedToys.status
                }
            }
            const result= await toysCollection.updateOne(filter,updatedToys)
            res.send(result)
        })

        // delete toys
        app.delete('/alltoys/:id',async(req,res)=>{
            const id = req.params.id;
            const filter ={_id:new ObjectId(id)}
            const result = await toysCollection.deleteOne(filter)
            res.send(result)
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


app.get('/', (req, res) => {
    res.send('toys car server is running....')
})

app.listen(port, () => {
    console.log(`toys car running on port:${port}`)
})