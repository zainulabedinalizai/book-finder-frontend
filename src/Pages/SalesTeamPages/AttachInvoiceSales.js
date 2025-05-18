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
  TextareaAutosize
} from '@mui/material';
import { Search, Refresh, AttachFile } from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import { patientAPI } from '../../Api/api';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [actionType, setActionType] = useState('approve');

  // Status IDs specific to Sales role
  const SALES_STATUS = {
    APPROVE: 7,  // Completed
    REJECT: 6    // Rejected by Sales
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

  const handleStatusUpdate = async () => {
    try {
      if (!selectedApp) {
        throw new Error("No application selected");
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
        ImagePath: file
      };

      const response = await patientAPI.updateUserApplication(params);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Application status updated successfully',
          severity: 'success'
        });
        // Update the local state with the returned data
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
    }
  };

  const openActionDialog = (app, action) => {
    setSelectedApp(app);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 5: return 'info';    // Ready for Sales
      case 6: return 'error';   // Rejected by Sales
      case 7: return 'success'; // Completed
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Sales Dashboard
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Applications Ready for Processing</Typography>
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
          InputProps={{
            startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
          }}
          sx={{ mb: 2 }}
        />
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No applications found ready for sales processing
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
                            variant="contained" 
                            color="success" 
                            size="small"
                            onClick={() => openActionDialog(app, 'approve')}
                          >
                            Complete
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Complete Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Application: <strong>{selectedApp?.application_title}</strong>
            </Typography>
            <Typography variant="body2" gutterBottom>
              ID: {selectedApp?.application_id}
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextareaAutosize
              minRows={3}
              placeholder={
                actionType === 'approve' 
                  ? 'Enter completion notes (optional)...' 
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
                {actionType === 'approve' ? 'Upload Final Documents' : 'Upload Rejection Notes'}
              </Button>
            </label>
            {fileName && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {fileName}
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
            disabled={loading || (actionType === 'reject' && !feedback)}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : actionType === 'approve' ? (
              'Mark as Completed'
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
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttachInvoiceSale;