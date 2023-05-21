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
        const featureToys = client.db('toys').collection('feature-product')
        

        app.get('/alltoys', async (req, res) => {
            const sort = req.query.sort;
            const limit = parseInt(req.query.limit) || 20;
            const query = req.query.email ? { email: req.query.email } : {};

            try {
                const result = await toysCollection.find(query).limit(limit).toArray();
                res.send(result);
            } catch (error) {
                console.error('Error retrieving toys:', error);
                res.status(500).send('Internal Server Error');
            }

            const search = {title: { $regex: search, $options: 'i'}}
            const options = {
                // sort matched documents in descending order by rating
                sort: { 
                    "price": sort === 'asc' ? 1 : -1
                }
            }
            const result =await toysCollection.find(search,options).toArray()
            res.send(result)
               
        });

        app.get('/categorytoys', async (req, res) => {
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/categorytoys/:text', async (req, res) => {

            console.log(req.params.text);

            if (req.params.text == "sports" || req.params.text == "police" || req.params.text == "truck") {
                const result = await toysCollection
                    .find({ sub_category: req.params.text })
                    .toArray();
                console.log(result);
                return res.send(result);
            }

        });

        app.get('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })




        //  feature product for client side
        app.get('/featuretoys', async (req, res) => {
            const result = await featureToys.find().toArray();
            res.send(result)
        })



        // post toy

        app.post('/alltoys', async (req, res) => {
            const newToy = req.body;
            const result = await toysCollection.insertOne(newToy);
            res.send(result)

        })

        // update toys

        app.patch('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const updatedToy = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateData = {
                $set: {
                    price: updatedToy.price,
                    toy_description: updatedToy.toy_description,
                    available_quantity: updatedToy.available_quantity
                }
            }

            const result = await toysCollection.updateOne(query, updateData, options)
            res.send(result)

        });

        // delete toys
        app.delete('/alltoys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(filter)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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