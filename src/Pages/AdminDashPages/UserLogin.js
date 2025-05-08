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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import { Search, Refresh } from '@mui/icons-material';
import { userAPI } from '../../Api/api';

const UserLogin = () => {
  const [users, setUsers] = useState([]);
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

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userAPI.getUserList(-1); // Use -1 to get all users
      
      if (response.data.success) {
        // Format the user data with FullName
        const formattedUsers = response.data.data.map(user => ({
          ...user,
          FullName: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'N/A'
        }));
        setUsers(formattedUsers);
      } else {
        throw new Error(response.data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      setLoading(true);
      const statusId = newStatus ? 1 : 0;
      
      // Call the API to update the status
      const response = await userAPI.updateUserStatus(userId, statusId);
      
      if (response.data.success) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.UserId === userId 
              ? { ...user, AccountStatus: statusId } 
              : user
          )
        );
        
        setSnackbar({
          open: true,
          message: 'User status updated successfully',
          severity: 'success'
        });
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update user status. Please try again.');
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update user status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.Username?.toLowerCase().includes(searchLower)) ||
      (user.Email?.toLowerCase().includes(searchLower)) ||
      (user.FullName?.toLowerCase().includes(searchLower)) ||
      (user.RoleName?.toLowerCase().includes(searchLower))
    );
  });

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredUsers.length - page * rowsPerPage);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        User Login Management
      </Typography>
      
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">User List</Typography>
          <Box>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchUsers} disabled={loading}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
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
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.UserId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }}>
                            {user.FullName?.charAt(0) || 'U'}
                          </Avatar>
                          {user.FullName}
                        </Box>
                      </TableCell>
                      <TableCell>{user.Username}</TableCell>
                      <TableCell>{user.Email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.RoleName} 
                          color={
                            user.RoleName === 'Admin' ? 'primary' : 'default'
                          } 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.AccountStatus === 1 ? 'Active' : 'Inactive'} 
                          color={user.AccountStatus === 1 ? 'success' : 'error'} 
                        />
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth variant="standard">
                          <Select
                            value={user.AccountStatus}
                            onChange={(e) => handleStatusChange(user.UserId, e.target.value === 1)}
                            sx={{ minWidth: 120 }}
                            disabled={loading}
                          >
                            <MenuItem value={1}>Active</MenuItem>
                            <MenuItem value={0}>Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </TableCell>
                    </TableRow>
                  ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}
      </Paper>

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

export default UserLogin;