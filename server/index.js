const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Import User model
const User = require("./models/User");

// Import Program model
const Program = require("./models/Program");

// Import Engagement model
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

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send("Server is running");
});

// ======================================================
// USER APIs
// ======================================================

// GET API - Read users from database
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// GET API - Read a single user by ID
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// POST API - Write a user to database
app.post("/api/users", async (req, res) => {
  try {
    const user = new User(req.body);

    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// ======================================================
// AUTHENTICATION - REGISTER
// ======================================================

// POST API - Register a new user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Check required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Name, username, email and password are required",
      });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role: role || "participant",
    });

    // Save user to MongoDB
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      username: user.username,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

// ======================================================
// AUTHENTICATION - LOGIN
// ======================================================

// POST API - Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check required fields
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    // Find user and include password
    const user = await User.findOne({ username }).select("+password");

    // Check if user exists
    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Compare entered password with hashed password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    // Check password
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    // Login successful
    res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

// ======================================================
// PROGRAM APIs
// ======================================================

// POST API - Create a program
app.post("/api/programs", async (req, res) => {
  try {
    const program = new Program(req.body);

    const savedProgram = await program.save();

    res.status(201).json(savedProgram);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// PUT API - Update a program
app.put("/api/programs/:id", async (req, res) => {
  try {
    const updatedProgram = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProgram) {
      return res.status(404).json({
        message: "Program not found",
      });
    }

    res.status(200).json(updatedProgram);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// GET API - Read all programs
app.get("/api/programs", async (req, res) => {
  try {
    const programs = await Program.find();

    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// DELETE API - Delete a program
app.delete("/api/programs/:id", async (req, res) => {
  try {
    const deletedProgram = await Program.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProgram) {
      return res.status(404).json({
        message: "Program not found",
      });
    }

    res.status(200).json({
      message: "Program deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

// ======================================================
// ENGAGEMENT APIs
// ======================================================

// GET API - Read engagements with related User and Program
app.get("/api/engagements", async (req, res) => {
  try {
    const engagements = await Engagement.find()
      .populate("user")
      .populate("program");

    res.status(200).json(engagements);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// POST API - Create an engagement
app.post("/api/engagements", async (req, res) => {
  try {
    const engagement = new Engagement(req.body);

    const savedEngagement = await engagement.save();

    const populatedEngagement =
      await Engagement.findById(savedEngagement._id)
        .populate("user")
        .populate("program");

    res.status(201).json(populatedEngagement);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});