// PersonalProfileDesign.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Container, Card, CardContent,
  TextField, Button, Avatar, FormControl, InputLabel,
  Select, MenuItem, Divider, Grid, CircularProgress, Alert
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

const PersonalProfileDesign = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    Username: '',
    FullName: '',
    Email: '',
    DateOfBirth: '',
    Phone: '',
    Gender: '',
    ResidentialAddress: '',
    RoleName: '',
    AccountStatus: 0,
    ProfilePath: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
      setFormData({
        Username: user.Username || '',
        FullName: user.FullName || '',
        Email: user.Email || '',
        DateOfBirth: user.DateOfBirth?.split('T')[0] || '',
        Phone: user.Phone || '',
        Gender: user.Gender || 'M',
        ResidentialAddress: user.ResidentialAddress || '',
        RoleName: user.RoleName || 'User',
        AccountStatus: user.AccountStatus || 0,
        ProfilePath: user.ProfilePicture || ''
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // You can call your API to update user profile here
      // Simulating success:
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEditMode(false);
      }, 1500);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setFormData({
      Username: user.Username || '',
      FullName: user.FullName || '',
      Email: user.Email || '',
      DateOfBirth: user.DateOfBirth?.split('T')[0] || '',
      Phone: user.Phone || '',
      Gender: user.Gender || 'M',
      ResidentialAddress: user.ResidentialAddress || '',
      RoleName: user.RoleName || 'User',
      AccountStatus: user.AccountStatus || 0,
      ProfilePath: user.ProfilePicture || ''
    });
    setEditMode(false);
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4">My Profile</Typography>
            {editMode ? (
              <Box>
                <Button variant="contained" color="success" startIcon={<Save />} onClick={handleSave} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Save'}
                </Button>
                <Button variant="outlined" color="error" startIcon={<Cancel />} onClick={handleCancel} disabled={loading} sx={{ ml: 1 }}>
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button variant="contained" startIcon={<Edit />} onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
            )}
          </Box>

          {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

          <Box display="flex" alignItems="center" mb={4}>
            <Avatar sx={{ width: 100, height: 100, mr: 3 }} src={formData.ProfilePath}>
              {formData.FullName?.charAt(0) || formData.Username.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5">{formData.FullName}</Typography>
              <Typography variant="subtitle1">@{formData.Username}</Typography>
              <Typography variant="body2">{formData.RoleName}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Username" value={formData.Username} disabled />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Full Name" name="FullName" value={formData.FullName} onChange={handleInputChange} disabled={!editMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" name="Email" value={formData.Email} onChange={handleInputChange} disabled={!editMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Date of Birth" type="date" name="DateOfBirth" value={formData.DateOfBirth} onChange={handleInputChange} InputLabelProps={{ shrink: true }} disabled={!editMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" name="Phone" value={formData.Phone} onChange={handleInputChange} disabled={!editMode} />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editMode}>
                <InputLabel>Gender</InputLabel>
                <Select name="Gender" value={formData.Gender} onChange={handleInputChange}>
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" name="ResidentialAddress" multiline rows={3} value={formData.ResidentialAddress} onChange={handleInputChange} disabled={!editMode} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between">
            <Typography><strong>Account Status:</strong> {formData.AccountStatus === 1 ? 'Active' : 'Inactive'}</Typography>
            <Typography><strong>Role:</strong> {formData.RoleName}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PersonalProfileDesign;
