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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  Grid,
  Card,
  CardContent,
  Stack,
  useTheme,
} from "@mui/material";
import {
  Search,
  Refresh,
  AttachFile,
  Close,
  CheckCircle,
  Cancel,
  HelpOutline,
} from "@mui/icons-material";
import { useAuth } from "../../Context/AuthContext";
import { patientAPI } from "../../Api/api";
import { UploadEmployeeFiles } from "../../Api/api";

const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1,
};

const AddInvoicePharma = () => {
  const { user } = useAuth();
  const theme = useTheme();
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
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [filePath, setFilePath] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [actionType, setActionType] = useState("approve");

  const PHARMACIST_STATUS = {
    APPROVE: 5,
    REJECT: 6,
  };

  const fetchApplications = async () => {
    try {
      if (!user?.UserId || !user?.RoleId) {
        throw new Error("User information not available");
      }

      setLoading(true);
      setError(null);

      const response = await patientAPI.getRoleWiseApplication({
        RoleID: user.RoleId,
        UserID: user.UserId,
      });

      if (response.data.success) {
        setApplications(response.data.data);
      } else if (response.data.statusCode === "8004") {
        setApplications([]);
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

  const fetchStatusOptions = async () => {
    try {
      const response = await patientAPI.getDDLStatus();
      if (response.data.success) {
        setStatusOptions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching status options:", err);
      setSnackbar({
        open: true,
        message: "Failed to load status options",
        severity: "error",
      });
    }
  };

  const handleFileUpload = async (file) => {
    try {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result.split(",")[1];
        const fileData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type,
        };

        const params = {
          SubjectName: "PharmacyInvoices",
          AssignmentTitle: `Invoice_${selectedApp?.application_id}`,
          Path: "Assets/PharmacyInvoices/",
          Assignments: JSON.stringify([fileData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setFilePath(response.data[0]);
          setFileName(file.name);
          setSnackbar({
            open: true,
            message: "File uploaded successfully!",
            severity: "success",
          });
        } else {
          throw new Error(response.message || "Failed to upload file");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading file:", err);
      setSnackbar({
        open: true,
        message: "Failed to upload file. Please try again.",
        severity: "error",
      });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedApp) {
        throw new Error("No application selected");
      }

      if (actionType === "reject" && !feedback) {
        throw new Error("Rejection reason is required");
      }

      if (actionType === "approve" && !filePath) {
        throw new Error("Invoice file is required for approval");
      }

      setLoading(true);

      const statusId =
        actionType === "approve"
          ? PHARMACIST_STATUS.APPROVE
          : PHARMACIST_STATUS.REJECT;

      const params = {
        ID: selectedApp.application_id,
        StatusID: statusId,
        RoleID: user.RoleId,
        Description: feedback,
        ImagePath: filePath,
      };

      const response = await patientAPI.updateUserApplication(params);

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Application status updated successfully",
          severity: "success",
        });
        const updatedApplications = applications.map((app) =>
          app.application_id === selectedApp.application_id
            ? response.data.data[0]
            : app
        );
        setApplications(updatedApplications);
      } else {
        throw new Error(
          response.data.message || "Failed to update application"
        );
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to update application",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setSelectedApp(null);
      setFeedback("");
      setFile(null);
      setFileName("");
      setFilePath(null);
    }
  };

  const openActionDialog = (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      await handleFileUpload(selectedFile);
    }
  };

  const STATUS_MAPPINGS = {
    1: { name: "Pending", color: "warning" },
    2: { name: "ReviewedByDoctor", color: "primary" },
    5: { name: "ForwardedToSales", color: "info" },
    6: { name: "RejectedByPharmacist", color: "error" },
    7: { name: "Completed", color: "success" },
    // Add other statuses as needed
  };

  const getStatusName = (statusId) => {
    return STATUS_MAPPINGS[statusId]?.name || `Status ${statusId}`;
  };

  const getStatusColor = (statusId) => {
    return STATUS_MAPPINGS[statusId]?.color || "default";
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchApplications();
      fetchStatusOptions();
    }
  }, [user?.UserId, user?.RoleId]);

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    const statusName = getStatusName(app.status_id).toLowerCase();
    return (
      app.application_title?.toLowerCase().includes(searchLower) ||
      app.SubmittedDate?.toLowerCase().includes(searchLower) ||
      statusName.includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      {/* Updated Header Section */}
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
        <Box>
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
            <AttachFile fontSize="large" />
            Pharmacy Invoice Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Process and manage patient medication invoices
          </Typography>
        </Box>
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

      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
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
                startAdornment: (
                  <Search sx={{ color: "action.active", mr: 1 }} />
                ),
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

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : applications.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                p: 4,
                backgroundColor: theme.palette.background.default,
                borderRadius: 2,
              }}
            >
              <HelpOutline
                sx={{ fontSize: 60, color: "text.disabled", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary">
                No applications requiring processing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All patient applications have been processed
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: theme.palette.primary.light,
                    "& .MuiTableCell-root": {
                      color: theme.palette.common.white,
                      fontWeight: 600,
                    },
                  }}
                >
                  <TableRow>
                    <TableCell>Application</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((app) => (
                      <TableRow
                        key={app.application_id}
                        hover
                        sx={{
                          "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              sx={{
                                bgcolor: theme.palette.primary.main,
                                width: 40,
                                height: 40,
                              }}
                            >
                              {app.application_title?.charAt(0) || "P"}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>
                                {app.application_title ||
                                  "Untitled Application"}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                ID: {app.application_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {new Date(app.SubmittedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusName(app.status_id)}
                            color={getStatusColor(app.status_id)}
                            variant="outlined"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                              // Explicitly set colors based on status_id
                              ...(app.status_id === 1 && {
                                // Pending
                                borderColor: theme.palette.warning.main,
                                color: theme.palette.warning.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(app.status_id === 2 && {
                                // ReviewedByDoctor
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(app.status_id === 5 && {
                                // ForwardedToSales
                                borderColor: theme.palette.info.main,
                                color: theme.palette.info.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(app.status_id === 6 && {
                                // RejectedByPharmacist
                                borderColor: theme.palette.error.main,
                                color: theme.palette.error.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                              ...(app.status_id === 7 && {
                                // Completed
                                borderColor: theme.palette.success.main,
                                color: theme.palette.success.main,
                                backgroundColor: theme.palette.common.white,
                              }),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="Approve application">
                              <IconButton
                                onClick={() => openActionDialog(app, "approve")}
                                sx={{
                                  color: theme.palette.success.main,
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: theme.palette.success.main,
                                    color: theme.palette.common.white,
                                  },
                                }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject application">
                              <IconButton
                                onClick={() => openActionDialog(app, "reject")}
                                sx={{
                                  color: theme.palette.error.main,
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: theme.palette.error.main,
                                    color: theme.palette.common.white,
                                  },
                                }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 73 * emptyRows }}>
                      <TableCell colSpan={4} />
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
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  borderTop: `1px solid ${theme.palette.divider}`,
                }}
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "visible",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor:
              actionType === "approve"
                ? theme.palette.success.main
                : theme.palette.error.main,
            color: theme.palette.common.white,
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {actionType === "approve" ? (
            <CheckCircle fontSize="large" />
          ) : (
            <Cancel fontSize="large" />
          )}
          {actionType === "approve" ? "Approve Invoice" : "Reject Application"}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Application Details:</strong>
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>ID:</strong> {selectedApp?.application_id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Title:</strong> {selectedApp?.application_title}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Submitted:</strong>{" "}
                  {selectedApp?.SubmittedDate &&
                    new Date(selectedApp.SubmittedDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>Current Status:</strong>
                  <Chip
                    label={getStatusName(selectedApp?.status_id)}
                    color={getStatusColor(selectedApp?.status_id)}
                    size="small"
                    sx={{
                      ml: 1,
                      // Add these styles to ensure colors are visible
                      borderColor:
                        theme.palette[getStatusColor(selectedApp?.status_id)]
                          ?.main,
                      color:
                        theme.palette[getStatusColor(selectedApp?.status_id)]
                          ?.main,
                      backgroundColor: theme.palette.common.white,
                    }}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            label={
              actionType === "approve" ? "Pharmacy Notes" : "Rejection Reason"
            }
            name="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            multiline
            rows={4}
            required={actionType === "reject"}
            sx={{ mb: 3 }}
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
              },
            }}
          />

          {actionType === "approve" && (
            <Box
              sx={{
                border: `1px dashed ${theme.palette.divider}`,
                borderRadius: 2,
                p: 2,
                backgroundColor: theme.palette.background.default,
              }}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                style={{ display: "none" }}
                accept=".pdf,.jpg,.png,.jpeg"
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<AttachFile />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    mr: 2,
                  }}
                >
                  Upload Invoice
                </Button>
              </label>
              {fileName && (
                <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                  <strong>Selected:</strong> {fileName}
                  {filePath && (
                    <Typography
                      variant="caption"
                      display="block"
                      color="success.main"
                      sx={{ mt: 0.5 }}
                    >
                      File uploaded successfully
                    </Typography>
                  )}
                </Typography>
              )}
              <Typography
                variant="caption"
                display="block"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Upload the invoice document (PDF or image)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleStatusUpdate}
            color={actionType === "approve" ? "success" : "error"}
            variant="contained"
            disabled={
              loading ||
              (actionType === "reject" && !feedback) ||
              (actionType === "approve" && !filePath)
            }
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: "none",
              minWidth: 120,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : actionType === "approve" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
            alignItems: "center",
          }}
          iconMapping={{
            success: <CheckCircle fontSize="large" />,
            error: <Cancel fontSize="large" />,
            warning: <HelpOutline fontSize="large" />,
            info: <HelpOutline fontSize="large" />,
          }}
        >
          <Typography fontWeight={500}>{snackbar.message}</Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddInvoicePharma;
