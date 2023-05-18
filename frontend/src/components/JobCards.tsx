import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import { Job } from "../interfaces/Job";

export default function JobCards({
  jobs,
  jobFocusId,
  setJobFocusId,
  onDeleteJob,
  onToggleApplyJob,
}: {
  jobs: Job[];
  jobFocusId: string;
  setJobFocusId: any;
  onDeleteJob: any;
  onToggleApplyJob: any;
}) {
  return (
    <Grid container spacing={2}>
      {jobs.map(
        ({ id, title, href, companyName, location, scrapeLocation }) => {
          let locationType = { symbol: "?", color: "red" };
          if (scrapeLocation === "remote")
            locationType = { symbol: "R", color: "green" };
          if (scrapeLocation === "seattle")
            locationType = { symbol: "S", color: "blue" };
          return (
            <Grid item key={id}>
              <Card variant="outlined">
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
                  <Typography sx={{ fontSize: 10 }}>{companyName}</Typography>
                </CardContent>
                <CardActions disableSpacing sx={{ gap: 2 }}>
                  <Button
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setJobFocusId(id)}
                    variant={jobFocusId === id ? "contained" : "outlined"}
                    size="small"
                  >
                    More
                  </Button>
                  <Button
                    color="success"
                    variant="outlined"
                    onClick={() => onToggleApplyJob(id)}
                    size="small"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => onDeleteJob(id)}
                    size="small"
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        }
      )}
    </Grid>
  );
}
