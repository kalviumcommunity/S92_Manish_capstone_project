
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const multer = require("multer");

dotenv.config();

const app = express();
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

app.use(cors());
app.use(express.json());

// ======================================================
// IMPORT MODELS
// ======================================================

const User = require("./models/User");
const Program = require("./models/Program");
const Engagement = require("./models/Engagement");
const Upload = require("./models/Upload");

const { parseCsv, importEngagementRows } = require("./utils/csvImport");

// ======================================================
// JWT AUTHENTICATION MIDDLEWARE
// ======================================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Token required.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

// ======================================================
// TEST ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.send("Community Connect server is running");
});

// ======================================================
// USER APIs
// ======================================================

// GET all users
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Get users error:", error.message);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
});

// GET a single user
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID" });
  }
});

// POST a user (JWT protected)
app.post("/api/users", authenticateToken, async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Only admins may create other admins.
    const safeRole =
      role === "admin" && req.user.role !== "admin"
        ? "participant"
        : role;

    const user = new User({
      name,
      username,
      email,
      role: safeRole,
      // Never store a plain-text password.
      password: password ? await bcrypt.hash(password, 10) : undefined,
    });
    const savedUser = await user.save();

    const safeUser = await User.findById(savedUser._id).select("-password");

    res.status(201).json(safeUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================================================
// AUTHENTICATION - REGISTER
// ======================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Name, username, email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Do not allow public registration to create admin accounts.
    const safeRole = role === "organizer" ? "organizer" : "participant";

    const user = await User.create({
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
      role: safeRole,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }

    res.status(500).json({ message: "Registration failed" });
  }
});

// ======================================================
// AUTHENTICATION - USERNAME/PASSWORD LOGIN
// ======================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required",
      });
    }

    const user = await User.findOne({
      username: username.trim(),
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
});

// ======================================================
// AUTHENTICATION - GOOGLE LOGIN
// ======================================================

app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
      console.error("Google OAuth or JWT environment configuration is missing");

      return res.status(500).json({
        message: "Authentication service is not configured",
      });
    }

    // Verify the ID token with Google on the server.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        message: "A verified Google email is required",
      });
    }

    const email = payload.email.trim().toLowerCase();

    // Find an existing account or create a new participant.
    let user = await User.findOne({ email });

    if (!user) {
      const baseUsername =
        (email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") ||
          "communityuser").slice(0, 20);

      let username = baseUsername;
      let suffix = 1;

      while (await User.exists({ username })) {
        username = `${baseUsername}${suffix++}`;
      }

      try {
        user = await User.create({
          name: payload.name || baseUsername,
          username,
          email,
          role: "participant",
        });
      } catch (error) {
        // Handle two simultaneous sign-ins creating the same email.
        if (error.code === 11000) {
          user = await User.findOne({ email });
        } else {
          throw error;
        }
      }
    }

    if (!user) {
      return res.status(500).json({
        message: "Unable to retrieve the user account",
      });
    }

    // Issue the application's own JWT after Google's verification.
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Google authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google authentication error:", error.message);

    return res.status(401).json({
      message: "Google authentication failed",
    });
  }
});

// ======================================================
// AUTHENTICATION - GET CURRENT USER PROFILE
// ======================================================

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error.message);
    res.status(500).json({ message: "Failed to retrieve profile" });
  }
});

// ======================================================
// PROGRAM APIs
// ======================================================

// CREATE a program (JWT protected)
app.post("/api/programs", authenticateToken, async (req, res) => {
  try {
    const program = new Program(req.body);
    const savedProgram = await program.save();

    res.status(201).json(savedProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE a program (JWT protected)
app.put("/api/programs/:id", authenticateToken, async (req, res) => {
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

// GET all programs (JWT protected)
app.get("/api/programs", authenticateToken, async (req, res) => {
  try {
    const programs = await Program.find();
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a program (JWT protected)
app.delete("/api/programs/:id", authenticateToken, async (req, res) => {
  try {
    const deletedProgram = await Program.findByIdAndDelete(
      req.params.id
    );

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

// ======================================================
// ENGAGEMENT APIs
// ======================================================

// GET engagements with related user and program (JWT protected)
app.get("/api/engagements", authenticateToken, async (req, res) => {
  try {
    const engagements = await Engagement.find()
      .populate("user")
      .populate("program");

    res.status(200).json(engagements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE an engagement (JWT protected)
app.post("/api/engagements", authenticateToken, async (req, res) => {
  try {
    const engagement = new Engagement(req.body);
    const savedEngagement = await engagement.save();

    const populatedEngagement = await Engagement.findById(
      savedEngagement._id
    )
      .populate("user")
      .populate("program");

    res.status(201).json(populatedEngagement);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ======================================================
// FILE UPLOAD APIs
// ======================================================

const MAX_UPLOAD_SIZE = 2 * 1024 * 1024; // 2 MB

// Keep the file in memory; it is saved to MongoDB after import.
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE, files: 1 },
  fileFilter: (req, file, callback) => {
    if (/\.csv$/i.test(file.originalname)) {
      callback(null, true);
    } else {
      callback(new Error("Only .csv files are allowed"));
    }
  },
});

// Run multer and turn its errors into 400 responses
const handleCsvUpload = (req, res, next) => {
  csvUpload.single("file")(req, res, (error) => {
    if (!error) {
      return next();
    }

    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "File must be 2 MB or smaller"
        : error.message;

    res.status(400).json({ message });
  });
};

// Data sent to the client for an upload (never the file contents)
const formatUpload = (upload) => ({
  id: upload._id,
  originalName: upload.originalName,
  size: upload.size,
  rowCount: upload.rowCount,
  importedCount: upload.importedCount,
  skippedCount: upload.skippedCount,
  uploadedBy: upload.uploadedBy,
  createdAt: upload.createdAt,
});

// UPLOAD a CSV file and import its rows as engagements (JWT protected)
app.post(
  "/api/uploads",
  authenticateToken,
  handleCsvUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please choose a CSV file to upload",
        });
      }

      let rows;

      try {
        rows = parseCsv(req.file.buffer);
      } catch (error) {
        return res.status(400).json({
          message: `Could not read the CSV file: ${error.message}`,
        });
      }

      const result = await importEngagementRows(rows);

      const upload = await Upload.create({
        originalName: req.file.originalname,
        // Only .csv files pass the filter; browsers report various types
        mimeType: "text/csv",
        size: req.file.size,
        data: req.file.buffer,
        uploadedBy: req.user.id,
        rowCount: result.rowCount,
        importedCount: result.imported,
        skippedCount: result.skipped,
      });

      await upload.populate("uploadedBy", "name username");

      res.status(201).json({
        message: `Imported ${result.imported} of ${result.rowCount} rows`,
        upload: formatUpload(upload),
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (error) {
      console.error("Upload error:", error.message);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// GET all uploads, newest first (JWT protected)
app.get("/api/uploads", authenticateToken, async (req, res) => {
  try {
    const uploads = await Upload.find()
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name username");

    res.status(200).json(uploads.map(formatUpload));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DOWNLOAD the original file (JWT protected)
app.get(
  "/api/uploads/:id/download",
  authenticateToken,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid upload ID" });
      }

      const upload = await Upload.findById(req.params.id).select("+data");

      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      res.attachment(upload.originalName);
      res.type(upload.mimeType);
      res.send(upload.data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// DELETE an upload - only the uploader or an admin (JWT protected)
app.delete("/api/uploads/:id", authenticateToken, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid upload ID" });
    }

    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    if (
      String(upload.uploadedBy) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "You can only delete your own uploads",
      });
    }

    await upload.deleteOne();

    // Imported engagement records are kept.
    res.status(200).json({ message: "Upload deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// START SERVER AFTER ROUTES ARE REGISTERED
// ======================================================

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing from server/.env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing from server/.env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
