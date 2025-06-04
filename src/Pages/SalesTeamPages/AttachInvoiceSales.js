import React, { useState, useEffect } from 'react';
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
  InputAdornment
} from '@mui/material';
import { 
  Search, 
  Refresh, 
  AttachFile,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import { patientAPI } from '../../Api/api';
import { UploadEmployeeFiles } from '../../Api/api';

const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1
};

const AttachInvoiceSale = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [selectedApp, setSelectedApp] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [filePath, setFilePath] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [actionType, setActionType] = useState('approve');

  const SALES_STATUS = {
    APPROVE: 7,
    REJECT: 6
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
        const fileData = {
          Image: `${file.name}|${base64String}`,
          fileName: file.name,
          fileType: file.type
        };

        const params = {
          SubjectName: 'SalesDocuments',
          AssignmentTitle: `Document_${selectedApp?.application_id}`,
          Path: 'Assets/SalesDocuments/',
          Assignments: JSON.stringify([fileData])
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

      if (actionType === 'approve' && !filePath) {
        throw new Error("Document file is required for completion");
      }

      setLoading(true);
      
      const statusId = actionType === 'approve' 
        ? SALES_STATUS.APPROVE 
        : SALES_STATUS.REJECT;

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
      case 5: return 'info';
      case 6: return 'error';
      case 7: return 'success';
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DescriptionIcon fontSize="large" />
          Sales Applications
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
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Refresh
        </Button>
      </Box>

      <Paper elevation={3} sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 3
      }}>
        <Box sx={{ 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'background.default'
        }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'action.active' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                backgroundColor: 'background.paper'
              }
            }}
            sx={{ 
              maxWidth: 400,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'divider',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
          <Typography variant="body2" color="text.secondary">
            {filteredApplications.length} applications found
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: 300,
            backgroundColor: 'background.paper'
          }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ 
            m: 2,
            borderRadius: 2,
            boxShadow: 1
          }}>
            {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Alert severity="info" sx={{ 
            m: 2,
            borderRadius: 2,
            boxShadow: 1
          }}>
            No applications found ready for sales processing
          </Alert>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ 
                backgroundColor: 'primary.light',
                '& .MuiTableCell-root': {
                  color: 'common.white',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }
              }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Application</TableCell>
                  <TableCell>Submitted Date</TableCell>
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
                      sx={{ '&:last-child td': { borderBottom: 0 } }}
                    >
                      <TableCell>
                        <Chip 
                          label={app.application_id} 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ 
                            bgcolor: 'primary.main',
                            width: 32,
                            height: 32
                          }}>
                            {app.application_title?.charAt(0) || 'A'}
                          </Avatar>
                          <Typography fontWeight={500}>
                            {app.application_title}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon color="action" fontSize="small" />
                          <Typography variant="body2">
                            {app.SubmittedDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusName(app.status_id)} 
                          color={getStatusColor(app.status_id)}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Complete Application">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => openActionDialog(app, 'approve')}
                              sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                px: 2,
                                '&:hover': {
                                  backgroundColor: 'success.dark'
                                }
                              }}
                              startIcon={<CheckCircleIcon fontSize="small" />}
                            >
                              Complete
                            </Button>
                          </Tooltip>
                          <Tooltip title="Reject Application">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => openActionDialog(app, 'reject')}
                              sx={{
                                borderRadius: 1,
                                textTransform: 'none',
                                px: 2,
                                '&:hover': {
                                  backgroundColor: 'error.light',
                                  color: 'error.contrastText'
                                }
                              }}
                              startIcon={<CancelIcon fontSize="small" />}
                            >
                              Reject
                            </Button>
                          </Tooltip>
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
          </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredApplications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': {
              minHeight: 56
            }
          }}
        />
      </Paper>

      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'common.white',
          fontWeight: 600,
          py: 2
        }}>
          {actionType === 'approve' ? 'Complete Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ 
            mb: 3,
            p: 2,
            backgroundColor: 'background.default',
            borderRadius: 2
          }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              {selectedApp?.application_title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>ID:</strong> {selectedApp?.application_id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Submitted:</strong> {selectedApp?.SubmittedDate}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            variant="outlined"
            label={actionType === 'approve' ? 'Completion Notes' : 'Rejection Reason'}
            placeholder={
              actionType === 'approve' 
                ? 'Enter completion notes (optional)...' 
                : 'Enter rejection reason (required)...'
            }
            multiline
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required={actionType === 'reject'}
            sx={{ mb: 3 }}
          />

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            mb: 2
          }}>
            <input
              type="file"
              id="file-upload"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".pdf,.jpg,.png"
            />
            <label htmlFor="file-upload">
              <Button
                variant="contained"
                component="span"
                color="primary"
                startIcon={<AttachFile />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3
                }}
              >
                {actionType === 'approve' ? 'Upload Documents' : 'Upload Notes'}
              </Button>
            </label>
            {fileName && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Typography variant="body2">
                  {fileName}
                </Typography>
                {filePath && (
                  <CheckCircleIcon color="success" fontSize="small" />
                )}
              </Box>
            )}
          </Box>
          {actionType === 'approve' && !filePath && (
            <Typography variant="caption" color="error">
              * Document upload is required for completion
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading || 
              (actionType === 'reject' && !feedback) || 
              (actionType === 'approve' && !filePath)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : actionType === 'approve' ? (
              'Complete Application'
            ) : (
              'Reject Application'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3
          }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <CancelIcon fontSize="inherit" />
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttachInvoiceSale;