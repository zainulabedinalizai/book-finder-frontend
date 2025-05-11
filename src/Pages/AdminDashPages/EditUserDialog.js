import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Grid,
  Alert
} from '@mui/material';
import { userService } from '../../Context/authService';

const EditUserDialog = ({ 
  open, 
  onClose, 
  userId, 
  onUserUpdated,
  roles = [] // Ensure roles has a default value
}) => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    mobile: '',
    address: '',
    roleId: '',
    accountStatus: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUserData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        mobile: '',
        address: '',
        roleId: '',
        accountStatus: ''
      });
      setError(null);
      setFormErrors({});
    }
  }, [open]);

  // Fetch user data when dialog opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!open || !userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await userService.getUserList(userId);
        
        // Check if response.data.data exists and is an array with at least one item
        if (response.data.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const user = response.data.data[0];
          setUserData({
            username: user.Username || '',
            email: user.Email || '',
            firstName: user.FirstName || '',
            lastName: user.LastName || '',
            dob: user.DateOfBirth ? formatDateForInput(user.DateOfBirth) : '',
            gender: user.Gender === 'M' ? 'Male' : user.Gender === 'F' ? 'Female' : 'Other',
            mobile: user.Phone || '',
            address: user.ResidentialAddress || '',
            roleId: findRoleId(user.RoleName, roles),
            accountStatus: user.AccountStatus === 1 ? 'Active' : 'Inactive'
          });
        } else {
          throw new Error('User data not found or invalid format');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [open, userId, roles]);

  // Helper function to find role ID by name
  const findRoleId = (roleName, roles) => {
    if (!Array.isArray(roles)) return '';
    const role = roles.find(r => r.name === roleName);
    return role ? role.id : '';
  };

  // Helper function to format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!userData.username.trim()) errors.username = 'Username is required';
    if (!userData.email.trim()) errors.email = 'Email is required';
    if (!userData.firstName.trim()) errors.firstName = 'First name is required';
    if (!userData.dob) errors.dob = 'Date of birth is required';
    if (!userData.gender) errors.gender = 'Gender is required';
    if (!userData.mobile.trim()) errors.mobile = 'Mobile number is required';
    if (!userData.roleId) errors.roleId = 'Role is required';
    
    // Email validation
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      const userToUpdate = {
        userId,
        username: userData.username.trim(),
        email: userData.email.trim(),
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        dob: userData.dob,
        gender: userData.gender === 'Male' ? 'M' : userData.gender === 'Female' ? 'F' : 'O',
        mobile: userData.mobile.trim(),
        address: userData.address.trim(),
        roleId: Number(userData.roleId),
        accountStatus: userData.accountStatus === 'Active' ? 1 : 0
      };
      
      const response = await userService.updateUser(userToUpdate);
      
      if (response.data.success) {
        onUserUpdated();
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to update user");
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={userData.username}
                  onChange={handleInputChange}
                  error={!!formErrors.username}
                  helperText={formErrors.username}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={userData.dob}
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
                    value={userData.gender}
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
                  value={userData.mobile}
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
                    value={userData.roleId}
                    onChange={handleInputChange}
                  >
                    {Array.isArray(roles) && roles.map(role => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
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
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Account Status</InputLabel>
                  <Select
                    label="Account Status"
                    name="accountStatus"
                    value={userData.accountStatus}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  multiline
                  rows={3}
                  value={userData.address}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || submitting}
        >
          {submitting ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Saving...
            </>
          ) : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;