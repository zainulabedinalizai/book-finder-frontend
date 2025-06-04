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
  InputAdornment
} from '@mui/material';
import { Search, Refresh, Add } from '@mui/icons-material';
import { patientAPI } from '../../Api/api';
import { useAuth } from '../../Context/AuthContext';

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
  3: 'Approved by Doctor',
  4: 'Rejected by Pharmacist',
  5: 'Sent to Sales'
};

const STATUS_COLORS = {
  'Pending': 'warning',
  'Approved by Doctor': 'success',
  'Rejected by Pharmacist': 'error',
  'Sent to Sales': 'info'
};

const PatientApplicationPharma = () => {
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
        // Format status text based on status_id
        const formattedData = response.data.data.map(app => ({
          ...app,
          status: STATUS_MAPPING[app.status_id] || app.status
        }));
        setApplications(formattedData);
      } else if (response.data.statusCode === "8004") {
        setApplications([]); // No records found is a valid case
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

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (app.application_title?.toLowerCase().includes(searchLower)) ||
      (app.SubmittedDate?.toLowerCase().includes(searchLower)) ||
      (app.status?.toLowerCase().includes(searchLower))
    );
  });

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredApplications.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
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
          {getRoleTitle()}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {user?.RoleId === ROLES.PATIENT && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              New Application
            </Button>
          )}
          
          <Tooltip title="Refresh">
            <IconButton 
              onClick={fetchApplications} 
              disabled={loading}
              sx={{
                backgroundColor: 'primary.light',
                color: 'common.white',
                '&:hover': {
                  backgroundColor: 'primary.main'
                }
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
        mb: 3
      }}>
        <Box sx={{ p: 2 }}>
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
              sx: { borderRadius: 2 }
            }}
          />
        </Box>

        {!user?.UserId || !user?.RoleId ? (
          <Alert severity="warning" sx={{ m: 2, borderRadius: 2 }}>
            Please log in to view applications
          </Alert>
        ) : loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '200px'
          }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : applications.length === 0 ? (
          <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
            No applications found matching your role criteria
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
                  <TableCell>Title</TableCell>
                  <TableCell>Submitted Date</TableCell>
                  <TableCell>Status</TableCell>
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
                        <Typography variant="body2">
                          {app.SubmittedDate}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={app.status} 
                          color={STATUS_COLORS[app.status] || 'default'}
                          variant="filled"
                          sx={{ 
                            fontWeight: 500,
                            minWidth: 120
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid rgba(224, 224, 224, 1)'
              }}
            />
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar for notifications */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PatientApplicationPharma;