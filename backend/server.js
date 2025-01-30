const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");

const app = express();
const PORT = process.env.PORT || 5000;

// Use Helmet to set various HTTP headers for security
app.use(helmet());

// Set Content Security Policy (CSP) headers
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    objectSrc: ["'none'"],
  },
}));

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(cors());
app.use(bodyParser.json());

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Unauthorized");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send("Unauthorized");
    req.userId = decoded.userId;
    next();
  });
};

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// User Schema and Model
const User = mongoose.model("User", UserSchema);
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Entry Schema and Model
const Entry = mongoose.model("Entry", entrySchema);
const entrySchema = new mongoose.Schema({
  title: String,
  content: String,
});

// RESTful routes

// Registration Route
app.post(
  "/api/register",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered");
  }
);

// Login Route
app.post(
  "/api/login",
  [
    body("email").isEmail().withMessage("Enter a valid email"),
    body("password").notEmpty().withMessage("Password cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  }
);

app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});

app.get("/entries", async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
});

app.post("/entries", authMiddleware, async (req, res) => {
  const newEntry = new Entry(req.body);
  await newEntry.save();
  res.json(newEntry);
});

app.put("/entries/:id", authMiddleware, async (req, res) => {
  const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedEntry);
});

app.delete("/entries/:id", authMiddleware, async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.json({ message: "Entry deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
