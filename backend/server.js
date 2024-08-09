const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  jwt.verify(token, "secret", (err, decoded) => {
    if (err) return res.status(401).send("Unauthorized");
    req.userId = decoded.userId;
    next();
  });
};

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/portfolio");

// User Schema and Model
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", UserSchema);

// Entry Schema and Model
const entrySchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Entry = mongoose.model("Entry", entrySchema);

// RESTful routes

// Registration Route
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.status(201).send("User registered");
});

// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send("Invalid credentials");
  }
  const token = jwt.sign({ userId: user._id }, "secret");
  res.json({ token });
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});

app.get("/entries", async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});

app.post("/entries", async (req, res) => {
  const newEntry = new Entry(req.body);
  await newEntry.save();
  res.json(newEntry);
});

app.put("/entries/:id", async (req, res) => {
  const updatedEntry = await Entry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updatedEntry);
});

app.delete("/entries/:id", async (req, res) => {
  await Entry.findByIdAndDelete(req.params.id);
  res.json({ message: "Entry deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
