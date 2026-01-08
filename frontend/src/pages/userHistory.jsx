import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Divider,
} from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";

function UserHistory() {
  const routeTo = useNavigate();
  const { getHistoryOfUser } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getHistoryOfUser();
        setMeetings((data || []).slice().reverse());
      } catch (err) {
        console.error("Failed to fetch user history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  if (loading) {
    return (
      <Box
        height="60vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <IconButton
        sx={{ color: "white" }}
        onClick={() => {
          routeTo("/home");
        }}
      >
        <HomeIcon />
      </IconButton>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        Your Meeting History
      </Typography>

      {meetings.length === 0 ? (
        <Typography color="text.secondary">No meetings found.</Typography>
      ) : (
        <Stack spacing={2}>
          {meetings.map((meeting) => (
            <Card key={meeting._id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  Meeting Code: {meeting.meetingcode}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(meeting.date).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default UserHistory;
