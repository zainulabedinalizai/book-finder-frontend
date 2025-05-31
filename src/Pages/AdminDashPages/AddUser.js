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
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add, Edit, Delete, Search, Refresh } from '@mui/icons-material';
import { useAuth } from '../../Context/AuthContext';
import { authService, userService } from '../../Context/authService';
import EditUserDialog from './EditUserDialog';

const roles = [
  { id: 1, name: 'User', description: 'Regular authenticated user' },
  { id: 2, name: 'Admin', description: 'System administrator' },
  { id: 18, name: 'Inventory Manager', description: 'Medical supplies' },
  { id: 19, name: 'Physician', description: 'Doctors with full clinical access' },
  { id: 20, name: 'Nurse', description: 'Nursing staff' },
  { id: 21, name: 'Lab Technician', description: 'Diagnostic testing' },
  { id: 22, name: 'Front Desk', description: 'Patient registration' },
  { id: 23, name: 'Billing Specialist', description: 'Financial operations' },
  { id: 24, name: 'Pharmacist', description: 'Medication management' }
];

const AddUser = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    dob: '',
    gender: '',
    mobile: '',
    address: '',
    roleId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserList(-1);
      
      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          const formattedUsers = response.data.data.map(user => ({
            UserId: user.UserId,
            Username: user.Username,
            Email: user.Email,
            FullName: `${user.FirstName || ''} ${user.LastName || ''}`.trim() || 'N/A',
            RoleName: user.RoleName || 'Unknown',
            AccountStatus: user.AccountStatus === 1 ? 'Active' : 'Inactive',
            RoleID: user.RoleID || 1
          }));
          
          setUsers(formattedUsers);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } else {
        setError(response.data.message || "Failed to fetch users");
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

  const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setOpenEditDialog(true);
  };

  const handleDeleteUser = (userId) => {
    console.log('Delete user with ID:', userId);
  };

  const handleAddUser = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewUser({
      username: '',
      email: '',
      password: '',
      fullName: '',
      dob: '',
      gender: '',
      mobile: '',
      address: '',
      roleId: ''
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!newUser.username) errors.username = 'Username is required';
    if (!newUser.email) errors.email = 'Email is required';
    if (!newUser.password) errors.password = 'Password is required';
    if (!newUser.fullName) errors.fullName = 'Full name is required';
    if (!newUser.dob) errors.dob = 'Date of birth is required';
    if (!newUser.gender) errors.gender = 'Gender is required';
    if (!newUser.mobile) errors.mobile = 'Mobile number is required';
    if (!newUser.roleId) errors.roleId = 'Role is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const userToSubmit = {
        ...newUser,
        roleId: Number(newUser.roleId)
      };
      
      const response = await authService.adminRegister({
        ...userToSubmit,
        roleID: userToSubmit.roleId
      });
      
      if (response.data.success) {
        fetchUsers();
        handleCloseAddDialog();
      } else {
        setError(response.data.message || "Failed to add user");
      }
    } catch (err) {
      console.error('Error adding user:', err);
      setError(err.message || 'Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        User Management
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">User List</Typography>
              <Box>
                <Tooltip title="Refresh">
                  <IconButton onClick={fetchUsers}>
                    <Refresh />
                  </IconButton>
                </Tooltip>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<Add />}
                  sx={{ ml: 1 }}
                  onClick={handleAddUser}
                >
                  Add User
                </Button>
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
                                user.RoleID === 2 ? 'primary' : 
                                user.RoleID === 1 ? 'secondary' : 'default'
                              } 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.AccountStatus} 
                              color={user.AccountStatus === 'Active' ? 'success' : 'error'} 
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <IconButton 
                                color="primary"
                                onClick={() => handleEditUser(user.UserId)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                color="error"
                                onClick={() => handleDeleteUser(user.UserId)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
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
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Statistics
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Total Users: {users.length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Active Users: {users.filter(u => u.AccountStatus === 'Active').length}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Admin Users: {users.filter(u => u.RoleID === 2).length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Add User Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={newUser.username}
                  onChange={handleInputChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={newUser.fullName}
                  onChange={handleInputChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={newUser.dob}
                  onChange={handleInputChange}
                  error={!!formErrors.dob}
                  helperText={formErrors.dob}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    name="gender"
                    value={newUser.gender}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                  {formErrors.gender && (
                    <Typography variant="caption" color="error">
                      {formErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  name="mobile"
                  value={newUser.mobile}
                  onChange={handleInputChange}
                  error={!!formErrors.mobile}
                  helperText={formErrors.mobile}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!formErrors.roleId}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    name="roleId"
                    value={newUser.roleId}
                    onChange={handleInputChange}
                  >
                    {roles.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.roleId && (
                    <Typography variant="caption" color="error">
                      {formErrors.roleId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={newUser.address}
                  onChange={handleInputChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <EditUserDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
        roles={roles}
      />
    </Box>
  );
};

export default AddUser;