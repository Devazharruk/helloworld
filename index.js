const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");

// Create an Express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(
    "mongodb://junaid:junaid222@testing-shard-00-00.avc9c.mongodb.net:27017,testing-shard-00-01.avc9c.mongodb.net:27017,testing-shard-00-02.avc9c.mongodb.net:27017/?ssl=true&replicaSet=atlas-k0rmhp-shard-0&authSource=admin&retryWrites=true&w=majority&appName=testing",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Set view engine to EJS
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Define a simple schema and model for MongoDB
const ItemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", ItemSchema);

// Home route to display items from the database
app.get("/", async (req, res) => {
  const items = await Item.find();
  res.render("index", { items });
});

// Route to handle form submission to add a new item
app.post("/add-item", async (req, res) => {
  const newItem = new Item({ name: req.body.name });
  await newItem.save();
  res.redirect("/");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
