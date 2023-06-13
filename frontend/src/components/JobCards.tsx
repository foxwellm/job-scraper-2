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
  onApplyJob,
  onClaimJob,
}: {
  jobs: Job[];
  jobFocusId: string;
  setJobFocusId: any;
  onDeleteJob?: (id: string) => void;
  onApplyJob?: (id: string) => void;
  onClaimJob?: (id: string) => void;
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
                  {
                    onApplyJob && <Button
                    color="success"
                    variant="outlined"
                    onClick={() => onApplyJob(id)}
                    size="small"
                  >
                    Apply
                  </Button>
                  }
                  
                  {onDeleteJob && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => onDeleteJob(id)}
                      size="small"
                    >
                      Delete
                    </Button>
                  )}
                  {onClaimJob && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => onClaimJob(id)}
                      size="small"
                    >
                      Claim
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        }
      )}
    </Grid>
  );
}
