const express = require("express");
const cors = require('cors')

const app = express();
// Enable CORS
app.use(cors())

const { applyJob, getJobs, deleteJob } = require("../storage");

app.get("/jobs", (req, res) => {
  const jobs = getJobs();
  res.send(Object.values(jobs).filter(job => !job.isDeleted));
});

app.put('/jobs/delete/:id', (req, res) => {
  const id = req.params.id;
  deleteJob(id)
  res.send(id);
})

app.put('/jobs/apply/:id', (req, res) => {
  const id = req.params.id;

  applyJob(id)
  res.send(id);
})

// http://localhost:3000
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
