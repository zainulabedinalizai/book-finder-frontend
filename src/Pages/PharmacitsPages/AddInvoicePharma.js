import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, TextField, IconButton, Tooltip,
  CircularProgress, Alert, Avatar, Chip, Snackbar, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextareaAutosize, Grid
} from '@mui/material';
import { Search, Refresh, AttachFile, Close, CheckCircle, Cancel } from '@mui/icons-material';
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

const AddInvoicePharma = () => {
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

  const PHARMACIST_STATUS = {
    APPROVE: 5,
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
          SubjectName: 'PharmacyInvoices',
          AssignmentTitle: `Invoice_${selectedApp?.application_id}`,
          Path: 'Assets/PharmacyInvoices/',
          Assignments: JSON.stringify([fileData])
        };

        const response = await UploadEmployeeFiles(params);
        if (!response.error) {
          setFilePath(response.data[0]);
          setFileName(file.name);
          setSnackbar({
            open: true,
            message: 'File uploaded successfully!',
            severity: 'success'
          });
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
        throw new Error("Invoice file is required for approval");
      }

      setLoading(true);
      
      const statusId = actionType === 'approve' 
        ? PHARMACIST_STATUS.APPROVE 
        : PHARMACIST_STATUS.REJECT;

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
      case 3: return 'primary';    // Doctor approved
      case 5: return 'success';    // Forwarded to Sales
      case 6: return 'error';      // Rejected by Pharmacist
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AttachFile fontSize="large" />
          </Avatar>
          Pharmacy Invoice Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Applications">
            <IconButton 
              onClick={fetchApplications} 
              disabled={loading}
              sx={{ 
                backgroundColor: 'primary.light', 
                '&:hover': { backgroundColor: 'primary.main' },
                color: 'common.white'
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and Table Section */}
      <Paper elevation={3} sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        mb: 4
      }}>
        <Box sx={{ 
          p: 2,
          backgroundColor: 'primary.light',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ color: 'common.white' }}>
            Applications Ready for Processing
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              startAdornment: <Search sx={{ color: 'common.white', mr: 1 }} />,
              sx: { 
                backgroundColor: 'primary.main',
                borderRadius: 1,
                color: 'common.white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }
              }
            }}
            sx={{ 
              width: 300,
              '& .MuiInputBase-input': {
                color: 'common.white'
              }
            }}
          />
        </Box>

        <TableContainer>
          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: 300
            }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>
          ) : applications.length === 0 ? (
            <Alert severity="info" sx={{ m: 3 }}>
              No applications found ready for pharmacy processing
            </Alert>
          ) : (
            <>
              <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ 
                  backgroundColor: 'primary.light',
                  '& .MuiTableCell-root': {
                    color: 'common.white',
                    fontWeight: 600
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
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: 'primary.main',
                              width: 40,
                              height: 40
                            }}>
                              {app.application_title?.charAt(0) || 'A'}
                            </Avatar>
                            <Typography fontWeight={500}>
                              {app.application_title}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{app.SubmittedDate}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusName(app.status_id)} 
                            color={getStatusColor(app.status_id)}
                            variant="outlined"
                            sx={{ 
                              fontWeight: 500,
                              borderWidth: 2,
                              '& .MuiChip-label': { px: 1.5 }
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => openActionDialog(app, 'approve')}
                              sx={{
                                borderRadius: 2,
                                px: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                boxShadow: 'none'
                              }}
                              startIcon={<CheckCircle />}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => openActionDialog(app, 'reject')}
                              sx={{
                                borderRadius: 2,
                                px: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                borderWidth: 2
                              }}
                              startIcon={<Cancel />}
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
                sx={{
                  borderTop: '1px solid rgba(224, 224, 224, 1)',
                  '& .MuiTablePagination-toolbar': {
                    padding: 2
                  }
                }}
              />
            </>
          )}
        </TableContainer>
      </Paper>

      {/* Action Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: actionType === 'approve' ? 'success.main' : 'error.main',
          color: 'common.white',
          fontWeight: 600,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {actionType === 'approve' ? 'Approve Application' : 'Reject Application'}
          <IconButton 
            onClick={() => setDialogOpen(false)} 
            sx={{ color: 'common.white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 2,
                backgroundColor: 'background.default',
                borderRadius: 2,
                height: '100%'
              }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Application Details
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ID:</strong> {selectedApp?.application_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Title:</strong> {selectedApp?.application_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Submitted:</strong> {selectedApp?.SubmittedDate}
                  </Typography>
                  {selectedApp?.status_id && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Current Status:</strong> {getStatusName(selectedApp.status_id)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  {actionType === 'approve' ? 'Pharmacy Notes' : 'Rejection Reason'}
                </Typography>
                <TextareaAutosize
                  minRows={3}
                  placeholder={
                    actionType === 'approve' 
                      ? 'Enter any additional notes...' 
                      : 'Please provide the reason for rejection...'
                  }
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem'
                  }}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required={actionType === 'reject'}
                />
              </Box>
              
              {actionType === 'approve' && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                    Upload Invoice
                  </Typography>
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.jpg,.png,.doc,.docx"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFile />}
                      sx={{ 
                        mr: 2,
                        borderRadius: 2,
                        textTransform: 'none',
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 }
                      }}
                    >
                      Select File
                    </Button>
                  </label>
                  {fileName && (
                    <Box sx={{ mt: 1.5 }}>
                      <Chip
                        label={fileName}
                        onDelete={() => {
                          setFile(null);
                          setFileName('');
                          setFilePath(null);
                        }}
                        deleteIcon={<Close />}
                        variant="outlined"
                        sx={{ 
                          borderRadius: 1,
                          px: 1,
                          '& .MuiChip-deleteIcon': { fontSize: '1rem' }
                        }}
                      />
                      {filePath && (
                        <Typography variant="caption" display="block" color="success.main" sx={{ mt: 0.5 }}>
                          File ready for submission
                        </Typography>
                      )}
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Accepted formats: PDF, JPG, PNG, DOC (Max 5MB)
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setDialogOpen(false)}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusUpdate} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading || (actionType === 'reject' && !feedback) || (actionType === 'approve' && !filePath)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none' }
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : actionType === 'approve' ? (
              'Approve & Forward'
            ) : (
              'Confirm Rejection'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3,
            alignItems: 'center'
          }}
          iconMapping={{
            success: <CheckCircle fontSize="inherit" />,
            error: <Cancel fontSize="inherit" />
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddInvoicePharma;