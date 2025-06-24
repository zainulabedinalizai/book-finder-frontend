import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Snackbar,
  Button,
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import {
  Search,
  Refresh,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { patientAPI } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";

const AppStatsPatient = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchApplications = async () => {
    try {
      if (!user?.UserId) {
        throw new Error("User ID not available");
      }

      setLoading(true);
      setError(null);

      const response = await patientAPI.getPatientApplication({
        UserID: user.UserId,
      });

      if (response.data.success) {
        setApplications(response.data.data || []);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch applications"
        );
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(
        err.message || "Failed to fetch applications. Please try again."
      );
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch applications",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.UserId) {
      fetchApplications();
    }
  }, [user?.UserId]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      app.application_title?.toLowerCase().includes(searchLower) ||
      app.SubmittedDate?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "reviewedbydoctor":
        return "primary";
      case "forwardedtosales":
        return "info";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircleIcon fontSize="small" />;
      case "rejected":
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusChipStyles = (status, theme) => {
    const statusLower = status?.toLowerCase();

    const baseStyles = {
      fontWeight: 500,
      borderRadius: 1,
      variant: "outlined",
      backgroundColor: theme.palette.common.white,
    };

    switch (statusLower) {
      case "pending":
        return {
          ...baseStyles,
          variant: "outlined",
          borderColor: theme.palette.warning.main,
          color: theme.palette.warning.main,
        };
      case "approved":
      case "completed":
        return {
          ...baseStyles,
          variant: "outlined",
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
        };
      case "rejected":
        return {
          ...baseStyles,
          variant: "outlined",
          borderColor: theme.palette.error.main,
          color: theme.palette.error.main,
        };
      case "reviewedbydoctor":
        return {
          ...baseStyles,
          variant: "outlined",
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
        };
      case "forwardedtosales":
        return {
          ...baseStyles,
          variant: "outlined",
          borderColor: theme.palette.info.main,
          color: theme.palette.info.main,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          p: 2,
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <DescriptionIcon fontSize="large" />
          My Patient Applications
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={fetchApplications}
          disabled={loading}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Refresh
        </Button>
      </Box>

      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "background.default",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
              size: "small",
            }}
            sx={{
              maxWidth: 400,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "background.paper",
              },
            }}
          />
        </Box>

        {!user?.UserId ? (
          <Alert
            severity="warning"
            sx={{
              m: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            Please log in to view your applications
          </Alert>
        ) : loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "200px",
              backgroundColor: "background.paper",
              borderRadius: 2,
              p: 4,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{
              m: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Alert
            severity="info"
            sx={{
              m: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            No applications found
          </Alert>
        ) : isSmallScreen ? (
          // Mobile view - card list
          <Box sx={{ p: 2 }}>
            {filteredApplications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((app, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 32,
                        height: 32,
                      }}
                    >
                      {app.application_title?.charAt(0) || "A"}
                    </Avatar>
                    <Typography variant="subtitle2" noWrap fontWeight={500}>
                      {app.application_title}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {app.SubmittedDate}
                    </Typography>
                    <Chip
                      variant="outlined"
                      label={app.status}
                      sx={getStatusChipStyles(app.status, theme)}
                      icon={getStatusIcon(app.status)}
                      size="small"
                    />
                  </Stack>
                </Paper>
              ))}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredApplications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              size="small"
              sx={{
                "& .MuiTablePagination-toolbar": {
                  justifyContent: "center",
                },
              }}
            />
          </Box>
        ) : (
          // Desktop view - table
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead
                sx={{
                  backgroundColor: "primary.light",
                  "& .MuiTableCell-root": {
                    color: "common.white",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  },
                }}
              >
                <TableRow>
                  <TableCell>Applicant Title</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((app, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{ "&:last-child td": { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              width: 32,
                              height: 32,
                            }}
                          >
                            {app.application_title?.charAt(0) || "A"}
                          </Avatar>
                          <Typography fontWeight={500}>
                            {app.application_title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {app.SubmittedDate}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={app.status}
                          variant="outlined"
                          sx={{
                            fontWeight: 500,
                            borderRadius: 1,
                            ...(app.status === "Pending" && {
                              borderColor: theme.palette.warning.main,
                              color: theme.palette.warning.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status === "ReviewedByDoctor" && {
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status === "ForwardedToSales" && {
                              borderColor: theme.palette.info.main,
                              color: theme.palette.info.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status === "RejectedBySales" && {
                              borderColor: theme.palette.error.main,
                              color: theme.palette.error.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                            ...(app.status === "Completed" && {
                              borderColor: theme.palette.success.main,
                              color: theme.palette.success.main,
                              backgroundColor: theme.palette.common.white,
                            }),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={3} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredApplications.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                "& .MuiTablePagination-toolbar": {
                  justifyContent: "flex-end",
                },
              }}
            />
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <CancelIcon fontSize="inherit" />,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AppStatsPatient;
