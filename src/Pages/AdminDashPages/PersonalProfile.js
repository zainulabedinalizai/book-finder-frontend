import React from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';

const PersonalProfileDesign = () => {
  // Mock data for design purposes only
  const profileData = {
    Username: 'johndoe',
    FullName: 'John Doe',
    Email: 'john.doe@example.com',
    DateOfBirth: '1990-01-01',
    Phone: '1234567890',
    Gender: 'M',
    ResidentialAddress: '123 Main St, Anytown, USA',
    RoleName: 'User',
    AccountStatus: 1
  };

  const [editMode, setEditMode] = React.useState(false);
  const [formData, setFormData] = React.useState({
    Username: profileData.Username,
    FullName: profileData.FullName,
    Email: profileData.Email,
    DateOfBirth: profileData.DateOfBirth,
    Phone: profileData.Phone,
    Gender: profileData.Gender,
    ResidentialAddress: profileData.ResidentialAddress
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleEditMode = () => setEditMode(!editMode);

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Typography variant="h4">My Profile</Typography>
            {editMode ? (
              <Box>
                <Button 
                  variant="contained" 
                  color="success" 
                  startIcon={<Save />}
                  onClick={toggleEditMode}
                  sx={{ mr: 1 }}
                >
                  Save
                </Button>
                <Button 
                  variant="outlined" 
                  color="error" 
                  startIcon={<Cancel />}
                  onClick={toggleEditMode}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={toggleEditMode}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          {/* Profile Picture and Basic Info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Avatar sx={{ 
              width: 100, 
              height: 100, 
              mr: 3,
              fontSize: '2.5rem',
              bgcolor: 'primary.main'
            }}>
              {profileData.FullName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h5">{profileData.FullName}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{profileData.Username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.RoleName}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Form Fields */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.Username}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.FullName}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.Email}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.Phone}
                onChange={handleInputChange}
                disabled={!editMode}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth disabled={!editMode} sx={{ mb: 2 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={formData.ResidentialAddress}
                onChange={handleInputChange}
                disabled={!editMode}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Status Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
            <Typography variant="subtitle1">
              <strong>Account Status:</strong> {profileData.AccountStatus === 1 ? 'Active' : 'Inactive'}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Role:</strong> {profileData.RoleName}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PersonalProfileDesign;