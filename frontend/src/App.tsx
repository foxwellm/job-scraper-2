import "./App.css";
import { useEffect, useState, SyntheticEvent } from "react";
import { Container, Tab, Box } from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import JobCards from "./components/JobCards";
import { Job } from "./interfaces/Job";

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobFocusId, setJobFocusId] = useState("");
  const [tabValue, setTabValue] = useState("1");

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await fetch("http://localhost:3000/jobs");
      const result = await response.json();
      setJobs(result);
    };
    fetchJobs();
  }, []);

  const onDeleteJob = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/jobs/delete/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJobs((currentJobs) => currentJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const onApplyJob = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/jobs/apply/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJobs((currentJobs) =>
        currentJobs.map((job) => {
          if (job.id === id) {
            return {
              ...job,
              hasApplied: true,
            };
          }
          return job;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onClaimJob = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/jobs/claim/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJobs((currentJobs) =>
        currentJobs.map((job) => {
          if (job.id === id) {
            return {
              ...job,
              hasClaimed: true,
            };
          }
          return job;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <TabContext value={tabValue}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            padding: 2,
            background: "white", // Customize the background color if needed
          }}
        >
          <TabList onChange={handleChange} centered>
            <Tab label="New Jobs" value="1" />
            <Tab label="Applied" value="2" />
            <Tab label="Claimed" value="3" />
          </TabList>
        </Box>

        <TabPanel value="1">
          <JobCards
            jobs={jobs.filter((job) => job.hasApplied === false)}
            jobFocusId={jobFocusId}
            setJobFocusId={setJobFocusId}
            onDeleteJob={onDeleteJob}
            onApplyJob={onApplyJob}
          />
        </TabPanel>
        <TabPanel value="2">
          <JobCards
            jobs={jobs.filter((job) => job.hasApplied && !job.hasClaimed)}
            jobFocusId={jobFocusId}
            setJobFocusId={setJobFocusId}
            onClaimJob={onClaimJob}
          />
        </TabPanel>
        <TabPanel value="3">
          <JobCards
            jobs={jobs.filter((job) => job.hasClaimed)}
            jobFocusId={jobFocusId}
            setJobFocusId={setJobFocusId}
          />
        </TabPanel>
      </TabContext>
    </Container>
  );
}

export default App;
