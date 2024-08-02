const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/yourDatabaseName", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const entrySchema = new mongoose.Schema({
  title: String,
  content: String,
});

const Entry = mongoose.model("Entry", entrySchema);

// RESTful routes
app.get("/entries", async (req, res) => {
  const entries = await Entry.find();
  res.json(entries);
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
