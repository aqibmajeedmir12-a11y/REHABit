const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const habitRoutes = require("./routes/habitRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// API routes
app.use("/api/habits", habitRoutes);

// Static frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = 3001;

const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

