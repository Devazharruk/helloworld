const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  transports: ["polling"], // force using long-polling
});

// Middleware for parsing JSON data
app.use(express.json());

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
app.set("views", path.join(__dirname, "views"));

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));

// Allow CORS
app.use(
  cors({
    credentials: true,
    methods: ["POST", "DELETE", "PUT", "GET"],
    origin: "*",
  })
);

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));

// Define schema and model
const ItemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", ItemSchema);

// Home route to display items
app.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.render("index", { items });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to add a new item (returns JSON)
app.post("/add-item", async (req, res) => {
  try {
    const newItem = new Item({ name: req.body.name });
    await newItem.save();

    // Emit event to all connected users
    io.emit("item-added", newItem);

    res.status(201).json(newItem); // Return newly created item
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to delete an item
app.post("/delete-item", async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.body.id);

    // Emit event to all connected users
    io.emit("item-deleted", req.body.id);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
