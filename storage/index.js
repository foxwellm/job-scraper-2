const fs = require("fs");
const path = require("path");

module.exports = {
  addJobs,
  applyJob,
  claimJob,
  deleteJob,
  findAllRemovedTitles,
  getJobs,
};

const jobsStorageFile = "jobs.json";

function addJobs(newJobs) {
  if (!Object.keys(newJobs).length) return;

  const filename = path.join(__dirname, jobsStorageFile);

  fs.readFile(filename, (err, fileData) => {
    if (err) {
      if (err.code === "ENOENT") {
        // File doesn't exist, create it
        return fs.writeFile(filename, JSON.stringify(newJobs), (err) => {
          if (err) console.error(err);
          console.log("File created and data written successfully!");
        });
      }
      console.error(err);
    }

    // File exists, parse the data and do something with it
    const currentJobs = JSON.parse(fileData);

    for (const job in newJobs) {
      // Only add if not already added
      if (!currentJobs[job]) {
        currentJobs[job] = newJobs[job];
      }
    }

    // Modify the data and write it back to the file
    fs.writeFile(filename, JSON.stringify(currentJobs), (err) => {
      if (err) console.error(err);
      console.log("Data written successfully!");
    });
  });
}

function findAllRemovedTitles() {
  const filename = path.join(__dirname, "title.json");

  try {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (err) {
    console.error(err);
  }
}

function getJobs() {
  const filename = path.join(__dirname, jobsStorageFile);

  try {
    return JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (err) {
    console.error(err);
  }
}

function deleteJob(id) {
  const filename = path.join(__dirname, jobsStorageFile);

  fs.readFile(filename, (err, fileData) => {
    const jobs = JSON.parse(fileData);

    jobs[id] = {
      ...jobs[id],
      isDeleted: true,
    };

    // Modify the data and write it back to the file
    fs.writeFile(filename, JSON.stringify(jobs), (err) => {
      if (err) console.error(err);
      console.log("Job Deleted successfully!");
    });
  });
}

function applyJob(id) {
  const filename = path.join(__dirname, jobsStorageFile);

  fs.readFile(filename, (err, fileData) => {
    const jobs = JSON.parse(fileData);

    jobs[id] = {
      ...jobs[id],
      hasApplied: true,
    };

    // Modify the data and write it back to the file
    fs.writeFile(filename, JSON.stringify(jobs), (err) => {
      if (err) console.error(err);
      console.log("Job Applied successfully!");
    });
  });
}

function claimJob(id) {
  const filename = path.join(__dirname, jobsStorageFile);

  fs.readFile(filename, (err, fileData) => {
    const jobs = JSON.parse(fileData);

    jobs[id] = {
      ...jobs[id],
      hasClaimed: true,
    };

    // Modify the data and write it back to the file
    fs.writeFile(filename, JSON.stringify(jobs), (err) => {
      if (err) console.error(err);
      console.log("Job Claimed successfully!");
    });
  });
}
