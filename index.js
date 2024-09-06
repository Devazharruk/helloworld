const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
// Create an Express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

// Set view engine to EJS
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.options(
  cors({
    credentials: true,
    methods: ["POST", "DELETE", "PUT", "GET"],
    origin: "*",
  })
);
app.use(
  cors({
    credentials: true,
    methods: ["POST", "DELETE", "PUT", "GET"],
    origin: "*",
  })
);
// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Define a simple schema and model for MongoDB
const ItemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", ItemSchema);

// Home route to display items from the database
app.get("/", async (req, res) => {
  try {
    const items = await Item.find(); // Awaiting database query
    res.render("index", { items });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle form submission to add a new item
app.post("/add-item", async (req, res) => {
  const newItem = new Item({ name: req.body.name });
  await newItem.save();
  res.redirect("/");
});
// Route to delete an item
app.post("/delete-item", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.body.id);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update an item
app.post("/update-item", async (req, res) => {
  try {
    await Item.findByIdAndUpdate(req.body.id, { name: req.body.name });
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// Route to handle form submission to add a new item
app.post("/add-item", async (req, res) => {
  try {
    const newItem = new Item({ name: req.body.name });
    await newItem.save();
    res.status(201).json(newItem); // Return new item as JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete an item
app.post("/delete-item", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.body.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
