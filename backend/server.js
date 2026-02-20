const express     = require("express");
const cors        = require("cors");
const bodyParser  = require("body-parser");
const path        = require("path");

require("./db");

const habitRoutes    = require("./routes/habitRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const aiRoutes       = require("./routes/aiRoutes");
const xpRoutes       = require("./routes/xpRoutes");
const featuresRoutes = require("./routes/featuresRoutes");

const app = express();

/* ── MIDDLEWARE ── */
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

/* ── STATIC FILES FIRST ── */
app.use(express.static(path.join(__dirname, "frontend")));

/* ── API ROUTES ── */
app.use("/api/habits",   habitRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/ai",       aiRoutes);
app.use("/api/xp",       xpRoutes);
app.use("/api/features", featuresRoutes);

/* ── FALLBACK ── */
app.use((req, res, next) => {
  if (req.path.match(/\.(js|css|html|png|ico|svg)$/)) {
    return res.status(404).send("File not found: " + req.path);
  }
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});