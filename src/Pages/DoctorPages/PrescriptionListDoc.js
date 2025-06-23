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
  DialogContentText,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Card,
  CardContent,
  Stack,
  Badge,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  Search,
  Refresh,
  AttachFile,
  Visibility,
  MedicalServices,
  Assignment,
  DateRange,
  CheckCircle,
  Cancel,
  HelpOutline,
} from "@mui/icons-material";
import { useAuth } from "../../Context/AuthContext";
import { patientAPI, submittedAnswersAPI } from "../../Api/api";
import { UploadEmployeeFiles } from "../../Api/api";

const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1,
};

const PrescriptionListDoc = () => {
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
  const [answersDialogOpen, setAnswersDialogOpen] = useState(false);
  const [patientAnswers, setPatientAnswers] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      console.error("No image path provided");
      return "";
    }

    // Handle cases where imagePath might already be a full URL
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // The API returns paths like "/Assets/PatientImages/..."
    // The correct base URL is "https://portal.medskls.com"
    const baseUrl = "https://portal.medskls.com/API";

    // Combine them, ensuring no double slashes
    const fullUrl = `${baseUrl}${
      imagePath.startsWith("/") ? "" : "/"
    }${imagePath}`;

    console.log("Constructed image URL:", fullUrl);
    return fullUrl;
  };

  const DOCTOR_STATUS = {
    APPROVE: 2,
    REJECT: 4,
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

  const fetchPatientAnswers = async (applicationId) => {
    try {
      setAnswersLoading(true);
      console.log("Fetching answers for application ID:", applicationId);

      const response = await submittedAnswersAPI.getByApplicationId(
        applicationId
      );

      if (response.data.success) {
        setPatientAnswers(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch patient answers"
        );
      }
    } catch (err) {
      console.error("Error fetching patient answers:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to fetch patient answers",
        severity: "error",
      });
    } finally {
      setAnswersLoading(false);
    }
  };

  const handleViewAnswers = (app) => {
    console.log("Application data being viewed:", app);

    setPatientAnswers([]);
    setSelectedApp(app);
    fetchPatientAnswers(app.application_id);
    setAnswersDialogOpen(true);
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
        const imageData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type,
        };

        const params = {
          SubjectName: "DoctorPrescriptions",
          AssignmentTitle: `Prescription_${selectedApp?.application_id}`,
          Path: "Assets/DoctorPrescriptions/",
          Assignments: JSON.stringify([imageData]),
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setFilePath(response.data[0]);
          setFileName(file.name);
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

      setLoading(true);

      const statusId =
        actionType === "approve" ? DOCTOR_STATUS.APPROVE : DOCTOR_STATUS.REJECT;

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

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "warning";
      case 2:
        return "primary";
      case 4:
        return "error";
      default:
        return "default";
    }
  };

  const getStatusName = (statusId) => {
    const status = statusOptions.find((s) => s.StatusID === statusId);
    return status ? status.StatusName : `Status ${statusId}`;
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

  const groupedAnswers = patientAnswers.reduce((acc, answer) => {
    if (!acc[answer.QuestionId]) {
      acc[answer.QuestionId] = {
        questionText: answer.QuestionText,
        questionType: answer.QuestionType,
        responses: [],
      };
    }
    acc[answer.QuestionId].responses.push(answer);
    return acc;
  }, {});

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
            <MedicalServices fontSize="large" />
            Prescription Review
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review and approve patient medication requests
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
                No applications requiring review
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
                            <DateRange color="action" fontSize="small" />
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
                            size="small"
                            sx={{
                              fontWeight: 500,
                              borderRadius: 1,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="center"
                          >
                            <Tooltip title="View patient answers">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewAnswers(app)}
                                sx={{
                                  backgroundColor: "action.hover",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                    color: "common.white",
                                  },
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
            color: theme.palette.getContrastText(
              actionType === "approve"
                ? theme.palette.info.main
                : theme.palette.info.main
            ),
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
          {actionType === "approve"
            ? "Approve Prescription"
            : "Reject Application"}
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
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            label={
              actionType === "approve"
                ? "Prescription Notes"
                : "Rejection Reason"
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
                Upload {actionType === "approve" ? "Prescription" : "Document"}
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
              {actionType === "approve"
                ? "Upload the signed prescription document (PDF or image)"
                : "Optional: Upload any supporting documents for rejection"}
            </Typography>
          </Box>
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

      {/* Patient Answers Dialog */}
      <Dialog
        open={answersDialogOpen}
        onClose={() => {
          setAnswersDialogOpen(false);
          setPatientAnswers([]);
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            fontWeight: 600,
            py: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Assignment />
          Patient Questionnaire Answers
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Application ID:</strong> {selectedApp?.application_id}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Title:</strong> {selectedApp?.application_title}
            </Typography>
          </Box>

          {answersLoading ? (
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
          ) : patientAnswers.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              No answers found for this application
            </Alert>
          ) : (
            <List
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                p: 0,
              }}
            >
              {Object.entries(groupedAnswers).map(
                ([questionId, questionData]) => {
                  if (questionId === "13") {
                    const frontImage = questionData.responses.find(
                      (r) => r.OptionId === 39
                    )?.front_imagepath;
                    const leftImage = questionData.responses.find(
                      (r) => r.OptionId === 40
                    )?.left_imagepath;
                    const rightImage = questionData.responses.find(
                      (r) => r.OptionId === 41
                    )?.right_imagepath;

                    console.log("Raw image paths from API:", {
                      // Debug log
                      frontImage,
                      leftImage,
                      rightImage,
                    });

                    return (
                      <React.Fragment key={questionId}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle1" fontWeight={600}>
                                {questionData.questionText}
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ mt: 2 }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  gutterBottom
                                >
                                  Patient submitted facial photos:
                                </Typography>
                                <Grid container spacing={2}>
                                  {frontImage && (
                                    <Grid item xs={12} md={4}>
                                      <Card
                                        elevation={0}
                                        sx={{
                                          border: `1px solid ${theme.palette.divider}`,
                                        }}
                                      >
                                        <CardContent sx={{ p: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                            gutterBottom
                                          >
                                            Front View
                                          </Typography>
                                          <img
                                            src={getImageUrl(frontImage)}
                                            alt="Front View"
                                            style={{
                                              maxWidth: "100%",
                                              maxHeight: 200,
                                              borderRadius: 1,
                                              objectFit: "contain",
                                              backgroundColor:
                                                theme.palette.grey[100],
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              console.error(
                                                "Failed to load front image:",
                                                frontImage
                                              );
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}
                                  {leftImage && (
                                    <Grid item xs={12} md={4}>
                                      <Card
                                        elevation={0}
                                        sx={{
                                          border: `1px solid ${theme.palette.divider}`,
                                        }}
                                      >
                                        <CardContent sx={{ p: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                            gutterBottom
                                          >
                                            Left Side View
                                          </Typography>
                                          <img
                                            src={getImageUrl(leftImage)}
                                            alt="Left Side View"
                                            style={{
                                              maxWidth: "100%",
                                              maxHeight: 200,
                                              borderRadius: 1,
                                              objectFit: "contain",
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "";
                                              console.error(
                                                "Failed to load left image:",
                                                leftImage
                                              );
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}
                                  {rightImage && (
                                    <Grid item xs={12} md={4}>
                                      <Card
                                        elevation={0}
                                        sx={{
                                          border: `1px solid ${theme.palette.divider}`,
                                        }}
                                      >
                                        <CardContent sx={{ p: 1 }}>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                            gutterBottom
                                          >
                                            Right Side View
                                          </Typography>
                                          <img
                                            src={getImageUrl(rightImage)}
                                            alt="Right Side View"
                                            style={{
                                              maxWidth: "100%",
                                              maxHeight: 200,
                                              borderRadius: 1,
                                              objectFit: "contain",
                                            }}
                                            onError={(e) => {
                                              e.target.onerror = null;
                                              e.target.src = "";
                                              console.error(
                                                "Failed to load right image:",
                                                rightImage
                                              );
                                            }}
                                          />
                                        </CardContent>
                                      </Card>
                                    </Grid>
                                  )}
                                </Grid>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  }

                  // Regular question handling
                  return (
                    <React.Fragment key={questionId}>
                      <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {questionData.questionText}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {questionData.questionType === "multiple_choice"
                                  ? "Selected options:"
                                  : "Selected option:"}
                              </Typography>
                              <Box
                                component="ul"
                                sx={{
                                  pl: 2,
                                  mt: 0.5,
                                  mb: 0,
                                  "& li": {
                                    py: 0.5,
                                  },
                                }}
                              >
                                {questionData.responses.map((response, idx) => (
                                  <li key={idx}>
                                    <Typography variant="body2">
                                      {response.OptionText}
                                      {response.TextResponse &&
                                        !response.TextResponse.startsWith(
                                          "{"
                                        ) &&
                                        ` - ${response.TextResponse}`}
                                    </Typography>
                                  </li>
                                ))}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                }
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setAnswersDialogOpen(false)}
            variant="outlined"
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

export default PrescriptionListDoc;
