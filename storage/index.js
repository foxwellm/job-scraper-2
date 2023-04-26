const fs = require("fs");
const path = require("path");

module.exports = {
  addJobs,
};

function addJobs(newJobs) {
  if (!Object.keys(newJobs).length) return;

  const filename = path.join(__dirname, "jobs.json");

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
