import { useEffect, useState } from "react";
import "./App.css";
import {
  Card,
  Container,
  Grid,
  CardContent,
  CardActions,
  Button,
  Typography,
  CardHeader,
  Avatar,
} from "@mui/material";

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  href: string;
  isDeleted: boolean;
  hasApplied: boolean;
  scrapeLocation: string;
}

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentJob, setCurrentJob] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const response = await fetch("http://localhost:3000/jobs");
      const result = await response.json();
      setJobs(result);
    };
    fetchJobs();
  }, []);

  const onDeleteClick = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/jobs/delete/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJobs((jo) =>
        jo.filter((j) => {
          if (j.id === id) return false;
          return true;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onApplyClick = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/jobs/apply/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setJobs((jo) =>
        jo.map((j) => {
          if (j.id === id) {
            return {
              ...j,
              hasApplied: true,
            };
          }
          return j;
        })
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container>
      <Grid container spacing={2}>
        {jobs.map(
          ({
            id,
            title,
            href,
            isDeleted,
            hasApplied,
            companyName,
            location,
            scrapeLocation,
          }) => {
            const backgroundColor = isDeleted
              ? "red"
              : hasApplied
              ? "green"
              : "white";
            let locationType = { symbol: "?", color: "red" };
            if (scrapeLocation === "remote")
              locationType = { symbol: "R", color: "green" };
            if (scrapeLocation === "seattle")
              locationType = { symbol: "S", color: "blue" };
            return (
              <Grid item key={id}>
                <Card variant="outlined" sx={{ backgroundColor }}>
                  <CardHeader
                    avatar={
                      <Avatar sx={{ bgcolor: locationType.color }}>
                        {locationType.symbol}
                      </Avatar>
                    }
                    title={title}
                    subheader={location}
                  />
                  <CardContent>
                    {/* <Typography sx={{ fontSize: 14 }}>{title}</Typography> */}
                    <Typography sx={{ fontSize: 10 }}>{companyName}</Typography>
                    {/* <Typography sx={{ fontSize: 10 }}>{location}</Typography> */}
                  </CardContent>
                  <CardActions>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      <Button
                        onClick={() => setCurrentJob(id)}
                        variant={currentJob === id ? "contained" : "outlined"}
                        size="small"
                      >
                        More
                      </Button>
                    </a>
                    <Button onClick={() => onDeleteClick(id)} size="small">
                      Delete
                    </Button>
                    <Button onClick={() => onApplyClick(id)} size="small">
                      Apply
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          }
        )}
      </Grid>
    </Container>
  );
}

export default App;
