const express = require("express");
const cors = require('cors')

const app = express();
// Enable CORS
app.use(cors())

const { getJobs } = require("../storage");

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.get("/jobs", (req, res) => {
  const jobs = getJobs();
  res.send(jobs);
});

// http://localhost:3000
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
