import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  useTheme,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";

const ViewDoctorFeedback = ({ open, onClose, application }) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.info.main,
          color: theme.palette.common.white,
          fontWeight: 600,
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Visibility fontSize="large" />
        Doctor's Feedback
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ m: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography>
                <strong>
                  ID: {application?.application_id} -{" "}
                  {application?.FullName || "N/A"}
                </strong>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                <strong>Title:</strong> {application?.application_title}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            p: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            <strong>Doctor's Feedback:</strong>
          </Typography>
          <Typography variant="body1">
            {application?.doctor_feedback || "No feedback provided by doctor"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="info"
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: "none",
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDoctorFeedback;
