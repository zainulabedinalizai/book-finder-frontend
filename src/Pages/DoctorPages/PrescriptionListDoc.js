import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, IconButton, Tooltip,
  CircularProgress, Alert, Avatar, Chip, Snackbar, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextareaAutosize, DialogContentText,
  List, ListItem, ListItemText, Divider, Grid
} from '@mui/material';
import { Search, Refresh, AttachFile, Visibility } from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import { patientAPI, submittedAnswersAPI } from '../../Api/api';
import { UploadEmployeeFiles } from '../../Api/api';

const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1
};

const PrescriptionListDoc = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [filePath, setFilePath] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [actionType, setActionType] = useState('approve');
  const [answersDialogOpen, setAnswersDialogOpen] = useState(false);
  const [patientAnswers, setPatientAnswers] = useState([]);
  const [answersLoading, setAnswersLoading] = useState(false);

  // Status IDs specific to Doctor role (matches SP logic)
  const DOCTOR_STATUS = {
    APPROVE: 2,  // Forward to Pharmacist
    REJECT: 4    // Rejected by Doctor
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
        UserID: user.UserId
      });
      
      if (response.data.success) {
        setApplications(response.data.data);
      } else if (response.data.statusCode === "8004") {
        setApplications([]);
      } else {
        throw new Error(response.data.message || "Failed to fetch applications");
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to fetch applications. Please try again.');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to fetch applications',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientAnswers = async (applicationId) => {
    try {
      setAnswersLoading(true);
      const response = await submittedAnswersAPI.getByApplicationId(applicationId);
      
      if (response.data.success) {
        setPatientAnswers(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch patient answers");
      }
    } catch (err) {
      console.error('Error fetching patient answers:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to fetch patient answers',
        severity: 'error'
      });
    } finally {
      setAnswersLoading(false);
    }
  };

  const handleViewAnswers = (app) => {
    setPatientAnswers([]); // Clear previous answers
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
      console.error('Error fetching status options:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load status options',
        severity: 'error'
      });
    }
  };

  const handleFileUpload = async (file) => {
    try {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target.result.split(',')[1];
        const imageData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type
        };

        const params = {
          SubjectName: 'DoctorPrescriptions',
          AssignmentTitle: `Prescription_${selectedApp?.application_id}`,
          Path: 'Assets/DoctorPrescriptions/',
          Assignments: JSON.stringify([imageData])
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setFilePath(response.data[0]);
          setFileName(file.name);
        } else {
          throw new Error(response.message || 'Failed to upload file');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading file:', err);
      setSnackbar({
        open: true,
        message: 'Failed to upload file. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedApp) {
        throw new Error("No application selected");
      }

      if (actionType === 'reject' && !feedback) {
        throw new Error("Rejection reason is required");
      }

      setLoading(true);
      
      const statusId = actionType === 'approve' 
        ? DOCTOR_STATUS.APPROVE 
        : DOCTOR_STATUS.REJECT;

      const params = {
        ID: selectedApp.application_id,
        StatusID: statusId,
        RoleID: user.RoleId,
        Description: feedback,
        ImagePath: filePath
      };

      const response = await patientAPI.updateUserApplication(params);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Application status updated successfully',
          severity: 'success'
        });
        const updatedApplications = applications.map(app => 
          app.application_id === selectedApp.application_id 
            ? response.data.data[0] 
            : app
        );
        setApplications(updatedApplications);
      } else {
        throw new Error(response.data.message || "Failed to update application");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update application',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setSelectedApp(null);
      setFeedback('');
      setFile(null);
      setFileName('');
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
      case 1: return 'warning';
      case 2: return 'info';
      case 4: return 'error';
      default: return 'default';
    }
  };

  const getStatusName = (statusId) => {
    const status = statusOptions.find(s => s.StatusID === statusId);
    return status ? status.StatusName : `Status ${statusId}`;
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchApplications();
      fetchStatusOptions();
    }
  }, [user?.UserId, user?.RoleId]);

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    const statusName = getStatusName(app.status_id).toLowerCase();
    return (
      app.application_title?.toLowerCase().includes(searchLower) ||
      app.SubmittedDate?.toLowerCase().includes(searchLower) ||
      statusName.includes(searchLower)
    );
  });

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  // Group answers by question for better display
  const groupedAnswers = patientAnswers.reduce((acc, answer) => {
    if (!acc[answer.QuestionId]) {
      acc[answer.QuestionId] = {
        questionText: answer.QuestionText,
        questionType: answer.QuestionType,
        responses: []
      };
    }
    acc[answer.QuestionId].responses.push(answer);
    return acc;
  }, {});

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Doctor Review Dashboard
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Applications Needing Review</Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchApplications} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} /> }}
          sx={{ mb: 2 }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : applications.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No applications found needing doctor review
          </Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((app) => (
                    <TableRow key={app.application_id}>
                      <TableCell>{app.application_id}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {app.application_title?.charAt(0) || 'A'}
                          </Avatar>
                          {app.application_title}
                        </Box>
                      </TableCell>
                      <TableCell>{app.SubmittedDate}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusName(app.status_id)} 
                          color={getStatusColor(app.status_id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="info"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewAnswers(app)}
                            sx={{ mr: 1 }}
                          >
                            View Answers
                          </Button>
                          <Button 
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => openActionDialog(app, 'approve')}
                          >
                            Approve
                          </Button>
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => openActionDialog(app, 'reject')}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={5} />
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
            />
          </TableContainer>
        )}
      </Paper>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Application ID: <strong>{selectedApp?.application_id}</strong>
            </Typography>
            <Typography variant="body1" gutterBottom>
              Title: <strong>{selectedApp?.application_title}</strong>
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextareaAutosize
              minRows={3}
              placeholder={
                actionType === 'approve' 
                  ? 'Enter prescription notes...' 
                  : 'Enter rejection reason (required)...'
              }
              style={{ width: '100%', padding: '8px' }}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required={actionType === 'reject'}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.png"
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<AttachFile />}
                sx={{ mr: 2 }}
              >
                Upload Prescription
              </Button>
            </label>
            {fileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {fileName}
                {filePath && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    File uploaded successfully
                  </Typography>
                )}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleStatusUpdate} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading || (actionType === 'reject' && !feedback) || (actionType === 'approve' && !filePath)}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : actionType === 'approve' ? (
              'Approve'
            ) : (
              'Reject'
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
      >
        <DialogTitle>
          Patient Questionnaire Answers
          <Typography variant="subtitle1">
            Application ID: {selectedApp?.application_id}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {answersLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : patientAnswers.length === 0 ? (
            <Alert severity="info">No answers found for this application</Alert>
          ) : (
            <List>
              {Object.entries(groupedAnswers).map(([questionId, questionData]) => {
                // Special handling for face photos question
                if (questionData.questionText.toLowerCase().includes('upload clear photos of your face')) {
                  try {
                    // Parse the first response's TextResponse (they all have the same images)
                    const images = JSON.parse(questionData.responses[0].TextResponse);
                    return (
                      <React.Fragment key={questionId}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                            primary={questionData.questionText}
                            secondary={
                              <Box sx={{ mt: 2 }}>
                                <Grid container spacing={2}>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.primary" gutterBottom>
                                      Front View
                                    </Typography>
                                    <img 
                                      src={images.FrontSide} 
                                      alt="Front View" 
                                      style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ddd' }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.primary" gutterBottom>
                                      Left Side View
                                    </Typography>
                                    <img 
                                      src={images.LeftSide} 
                                      alt="Left Side View" 
                                      style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ddd' }}
                                    />
                                  </Grid>
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.primary" gutterBottom>
                                      Right Side View
                                    </Typography>
                                    <img 
                                      src={images.RightSide} 
                                      alt="Right Side View" 
                                      style={{ maxWidth: '100%', maxHeight: '200px', border: '1px solid #ddd' }}
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    );
                  } catch (e) {
                    console.error('Error parsing face images:', e);
                    // Fallback to regular display if parsing fails
                  }
                }

                // Regular question display
                return (
                  <React.Fragment key={questionId}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={questionData.questionText}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {questionData.questionType === 'multiple_choice' ? 
                                'Selected options:' : 'Selected option:'}
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                              {questionData.responses.map((response, idx) => (
                                <li key={idx}>
                                  {response.OptionText}
                                  {response.TextResponse && !response.TextResponse.startsWith('{') && 
                                    ` - ${response.TextResponse}`}
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
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnswersDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrescriptionListDoc;