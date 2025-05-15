import React, { useState, useEffect, useContext } from 'react';
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
import { Search, Refresh } from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import { patientAPI } from '../../Api/api';
import { patientService } from '../../Context/authService';

// Role constants for better readability
const ROLES = {
  ADMIN: 2,
  DOCTOR: 19,
  PHARMACIST: 24,
  SALES: 23,
  PATIENT: 1
};

// Status constants mapping
const STATUS_MAPPING = {
  1: 'Pending',
  2: 'Doctor Reviewed',
  3: 'Approved by Doctor',
  4: 'Rejected by Pharmacist',
  5: 'Sent to Sales',
  6: 'Rejected by Sales',
  7: 'Completed'
};

const AttachInvoiceSales = () => {
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
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get role-specific title
  const getRoleTitle = () => {
    switch(user?.RoleId) {
      case ROLES.ADMIN: return 'All Applications (Admin View)';
      case ROLES.DOCTOR: return 'Applications Needing Doctor Review';
      case ROLES.PHARMACIST: return 'Applications Ready for Pharmacy';
      case ROLES.SALES: return 'Applications Ready for Sales';
      case ROLES.PATIENT: return 'My Applications';
      default: return 'Patient Applications';
    }
  };

  // Fetch applications based on role
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
        const formattedData = response.data.data.map(app => ({
          ...app,
          status: STATUS_MAPPING[app.status_id] || app.status
        }));
        setApplications(formattedData);
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

  // Handle application status update
  const handleStatusUpdate = async (statusId) => {
    try {
      setLoading(true);
      
      const params = {
        ID: selectedApp.application_id,
        StatusID: statusId,
        RoleID: user.RoleId,
        Description: feedback,
        ImagePath: file
      };

      const result = await patientService.updateUserApplication(params);
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: result.message || 'Application updated successfully',
          severity: 'success'
        });
        fetchApplications();
      } else {
        throw new Error(result.message || 'Failed to update application');
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
    }
  };

  // Open action dialog
  const openActionDialog = (app, action) => {
    setSelectedApp(app);
    
    // Set default status based on action
    let statusId;
    switch(action) {
      case 'approve': 
        statusId = user.RoleId === ROLES.DOCTOR ? 3 : 
                  user.RoleId === ROLES.PHARMACIST ? 5 : 7;
        break;
      case 'reject':
        statusId = user.RoleId === ROLES.DOCTOR ? 4 : 6;
        break;
      default:
        statusId = 2; // Default to doctor reviewed
    }
    
    setSelectedApp({...app, actionStatus: statusId});
    setDialogOpen(true);
  };

  useEffect(() => {
    if (user?.UserId && user?.RoleId) {
      fetchApplications();
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'approved by doctor': return 'success';
      case 'rejected by pharmacist': return 'error';
      case 'sent to sales': return 'info';
      case 'completed': return 'success';
      default: return 'default';
    }
  };

  // Render action buttons based on role and status
  const renderActions = (app) => {
    switch(user?.RoleId) {
      case ROLES.DOCTOR:
        return (
          <>
            <Button 
              size="small" 
              color="success" 
              onClick={() => openActionDialog(app, 'approve')}
              disabled={app.status_id !== 1 && app.status_id !== 4}
            >
              Approve
            </Button>
            <Button 
              size="small" 
              color="error" 
              onClick={() => openActionDialog(app, 'reject')}
              disabled={app.status_id !== 1 && app.status_id !== 4}
            >
              Reject
            </Button>
          </>
        );
      case ROLES.PHARMACIST:
        return (
          <Button 
            size="small" 
            color="primary" 
            onClick={() => openActionDialog(app, 'approve')}
            disabled={app.status_id !== 3}
          >
            Process
          </Button>
        );
      case ROLES.SALES:
        return (
          <Button 
            size="small" 
            color="secondary" 
            onClick={() => openActionDialog(app, 'approve')}
            disabled={app.status_id !== 5}
          >
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (app.application_title?.toLowerCase().includes(searchLower)) ||
      (app.SubmittedDate?.toLowerCase().includes(searchLower)) ||
      (app.status?.toLowerCase().includes(searchLower))
    );
  });

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        {getRoleTitle()}
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Application List</Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchApplications} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
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
        
        {!user?.UserId || !user?.RoleId ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please log in to view applications
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            No applications found matching your role criteria
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
                  {[ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.SALES].includes(user?.RoleId) && (
                    <TableCell>Actions</TableCell>
                  )}
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
                          label={app.status} 
                          color={getStatusColor(app.status)}
                        />
                      </TableCell>
                      {[ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.SALES].includes(user?.RoleId) && (
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {renderActions(app)}
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={
                      [ROLES.DOCTOR, ROLES.PHARMACIST, ROLES.SALES].includes(user?.RoleId) ? 5 : 4
                    } />
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

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedApp?.actionStatus === 3 || selectedApp?.actionStatus === 5 || selectedApp?.actionStatus === 7 ? 
            'Approve Application' : 'Reject Application'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextareaAutosize
              minRows={3}
              placeholder="Enter your feedback/comments"
              style={{ width: '100%', padding: '8px' }}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <input
              type="file"
              id="file-upload"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file-upload">
              {user.RoleId === ROLES.DOCTOR ? 'Upload Prescription' : 'Upload Invoice'}
            </label>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(selectedApp.actionStatus)} 
            color="primary"
            variant="contained"
            disabled={loading}
          >
            Submit
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

export default AttachInvoiceSales;