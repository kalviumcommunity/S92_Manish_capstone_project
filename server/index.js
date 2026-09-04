const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import User model
const User = require("./models/User");
// Import Program model
const Program = require("./models/Program");

const Engagement = require("./models/Engagement");
// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Test route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// GET API - Read users from database
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET API - Read a single user by ID

app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST API - Write a user to database
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST API - Create a program
app.post("/api/programs", async (req, res) => {
  try {
    const program = new Program(req.body);
    const savedProgram = await program.save();

    res.status(201).json(savedProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// PUT API - Update a program
app.put("/api/programs/:id", async (req, res) => {
  try {
    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProgram) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.status(200).json(updatedProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// GET API - Read all programs
app.get("/api/programs", async (req, res) => {
  try {
    const programs = await Program.find();
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE API - Delete a program
app.delete("/api/programs/:id", async (req, res) => {
  try {
    const deletedProgram = await Program.findByIdAndDelete(req.params.id);

    if (!deletedProgram) {
      return res.status(404).json({ message: "Program not found" });
    }

    res.status(200).json({
      message: "Program deleted successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET API - Read engagements with related User and Program
app.get("/api/engagements", async (req, res) => {
  try {
    const engagements = await Engagement.find()
      .populate("user")
      .populate("program");

    res.status(200).json(engagements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST API - Create an engagement
app.post("/api/engagements", async (req, res) => {
  try {
    const engagement = new Engagement(req.body);
    const savedEngagement = await engagement.save();

    const populatedEngagement = await Engagement.findById(savedEngagement._id)
      .populate("user")
      .populate("program");

    res.status(201).json(populatedEngagement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});