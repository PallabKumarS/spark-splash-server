const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("BrandShop Server Is Running");
});

// mongodb uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sk9bmp6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collection
    const productsCollection = client.db("productsDB").collection("products");
    const cartCollection = client.db("productsDB").collection("cart");

    // get all products data
    app.get("/products", async (req, res) => {
      const products = productsCollection.find();
      const result = await products.toArray();
      res.send(result);
      console.log("All Products Data Loaded");
    });

    // get products data by brand name
    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;
      const query = { brand: brand };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
      console.log("Data Found");
    });

    // get one product data
    app.get("/products/:brand/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
      console.log("one data found");
    });

    // posting product data
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
      console.log("Products Added Successfully");
    });

    // update product data
    app.put("/products/:brand/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedProduct = req.body;
      const product = {
        $set: {
          name: updatedProduct.name,
          brand: updatedProduct.quantity,
          type: updatedProduct.supplier,
          price: updatedProduct.taste,
          rating: updatedProduct.rating,
          photo: updatedProduct.photo,
        },
      };
      const result = await productsCollection.updateOne(
        query,
        product,
        options
      );
      res.send(result);
      console.log("Product Updated Successfully");
    });

    // posting cart data
    app.post("/cart", async (req, res) => {
      const product = req.body;
      const result = await cartCollection.insertOne(product);
      res.send(result);
      console.log("Product Added To Cart Successfully");
    });

    // get cart data
    app.get("/cart", async (req, res) => {
      const cart = cartCollection.find();
      const result = await cart.toArray();
      res.send(result);
      console.log("Cart Data Loaded");
    });

    // delete data
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
      console.log("Product Deleted Successfully");
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server Running on Port : ${port}`);
});
