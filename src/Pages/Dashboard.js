import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MedicalServices,
  People,
  CalendarToday,
  LocalHospital,
  Assignment,
  Notifications,
  CheckCircle,
  Pending,
  RateReview,
  Send,
  Summarize,
} from "@mui/icons-material";

import { useAuth } from "../Context/AuthContext";
import FavoritesQuerySearch from "./FavoritesQuerySearch";
import { dashboardAPI } from "../Api/api";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await dashboardAPI.getDashboardStatistics();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Helper function to get icon based on status
  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle fontSize="large" />;
      case "Pending":
        return <Pending fontSize="large" />;
      case "ReviewedByDoctor":
        return <RateReview fontSize="large" />;
      case "SentToSales":
        return <Send fontSize="large" />;
      case "Total":
        return <Summarize fontSize="large" />;
      default:
        return <Summarize fontSize="large" />;
    }
  };

  // Helper function to get color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "#4caf50";
      case "Pending":
        return "#ff9800";
      case "ReviewedByDoctor":
        return "#2196f3";
      case "SentToSales":
        return "#9c27b0";
      case "Total":
        return "#1976d2";
      default:
        return "#607d8b";
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: isMobile ? 2 : 4,
        px: { xs: 1, sm: 3 },
        pb: 4,
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          mb: 4,
          gap: isMobile ? 2 : 0,
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #1976d2, #2196f3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Medical Dashboard
        </Typography>
      </Box>

      {/* Tabs Section */}
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons="auto"
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": {
            height: 4,
            borderRadius: 2,
          },
        }}
      >
        <Tab
          label={isMobile ? null : "Overview"}
          icon={<MedicalServices />}
          iconPosition="start"
        />
        {/* <Tab label={isMobile ? null : "Appointments"} icon={<CalendarToday />} iconPosition="start" /> */}
      </Tabs>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <>
          {/* Stats Cards - Now in a single row */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {loading ? (
              // Loading state - show 5 loading cards (for all statuses + Total)
              Array.from({ length: 5 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Loading...
                          </Typography>
                          <Typography
                            variant={isMobile ? "h5" : "h4"}
                            sx={{ fontWeight: 700 }}
                          >
                            -
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: "#e0e0e0",
                            color: "#9e9e9e",
                            width: isMobile ? 40 : 56,
                            height: isMobile ? 40 : 56,
                          }}
                        >
                          <Summarize fontSize="large" />
                        </Avatar>
                      </Box>
                      <LinearProgress sx={{ mt: 2 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : stats ? (
              // Display all stats cards in one row
              stats.map((stat) => (
                <Grid item xs={12} sm={6} md={4} lg={2.4} key={stat.status}>
                  <StatCard
                    title={stat.status.replace(/([A-Z])/g, " $1").trim()}
                    value={stat.application_count}
                    icon={getStatusIcon(stat.status)}
                    color={getStatusColor(stat.status)}
                  />
                </Grid>
              ))
            ) : (
              // Error state
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                  <Typography color="error">
                    Failed to load dashboard statistics
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>

          <Grid container spacing={3}>
            {/* Upcoming Appointments (unchanged) */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 2, height: "100%" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Upcoming Appointments
                  </Typography>
                  <Button size="small" onClick={() => setTabValue(2)}>
                    View All
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          sx={{ textAlign: "center", py: 4 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            No upcoming appointments
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Application Status Distribution (new) */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 2, height: "100%" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Application Status Distribution
                  </Typography>
                </Box>
                {stats && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Status</TableCell>
                          <TableCell align="right">Count</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats
                          .filter((stat) => stat.status !== "Total")
                          .map((stat) => (
                            <TableRow key={stat.status}>
                              <TableCell>
                                <Chip
                                  label={stat.status
                                    .replace(/([A-Z])/g, " $1")
                                    .trim()}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${getStatusColor(
                                      stat.status
                                    )}20`,
                                    color: getStatusColor(stat.status),
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                {stat.application_count}
                              </TableCell>
                              <TableCell align="right">
                                {(
                                  (stat.application_count /
                                    stats.find((s) => s.status === "Total")
                                      .application_count) *
                                  100
                                ).toFixed(1)}
                                %
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Grid>

            {/* Notifications (moved to its own row) */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Notifications
                  </Typography>
                  <IconButton size="small">
                    <Notifications />
                  </IconButton>
                </Box>
                <Box
                  sx={{
                    maxHeight: 300,
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 150,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No new notifications
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {/* <Button 
              variant="contained" 
              startIcon={<Assignment />}
              onClick={() => navigate('/PatientSurvey')}
              fullWidth={isMobile}
            >
              Patient Form
            </Button> */}
          </Box>
        </>
      )}

      {/* Appointments Tab */}
      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: isMobile ? 1 : 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            All Appointments
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No appointments scheduled
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

// StatCard component for dashboard metrics
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        transition: "transform 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {title}
            </Typography>
            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{ fontWeight: 700 }}
            >
              {value || "-"}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}20`,
              color,
              width: isMobile ? 40 : 56,
              height: isMobile ? 40 : 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        <LinearProgress
          variant="determinate"
          value={0}
          sx={{
            mt: 2,
            height: 6,
            borderRadius: 3,
            backgroundColor: `${color}20`,
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default Dashboard;
