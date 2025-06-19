// PersonalProfileDesign.jsx
import React, { useState, useEffect } from "react";
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
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { userAPI } from "../../Api/api";

const PersonalProfileDoc = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    UserID: "",
    Username: "",
    FullName: "",
    Email: "",
    DateOfBirth: "",
    Phone: "",
    Gender: "",
    ResidentialAddress: "",
    RoleName: "",
    AccountStatus: 0,
    ProfilePath: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setFormData({
        UserID: user.UserID || "",
        Username: user.Username || "",
        FullName: user.FullName || "",
        Email: user.Email || "",
        DateOfBirth: user.DateOfBirth?.split("T")[0] || "",
        Phone: user.Phone || "",
        Gender: user.Gender || "M",
        ResidentialAddress: user.ResidentialAddress || "",
        RoleName: user.RoleName || "User",
        AccountStatus: user.AccountStatus || 0,
        ProfilePath: user.ProfilePicture || "",
      });

      if (user.ProfilePicture) {
        setPreviewImage(user.ProfilePicture);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

      // Update user data with the file
      setFormData((prev) => ({
        ...prev,
        ProfilePath: file,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.Email.trim()) errors.Email = "Email is required";
    if (!formData.FullName.trim()) errors.FullName = "Full name is required";
    if (!formData.DateOfBirth) errors.DateOfBirth = "Date of birth is required";
    if (!formData.Gender) errors.Gender = "Gender is required";
    if (!formData.Phone.trim()) errors.Phone = "Phone number is required";

    // Email validation
    if (formData.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errors.Email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      // Prepare the profile data
      const profileData = {
        UserID: formData.UserID,
        Email: formData.Email.trim(),
        FullName: formData.FullName.trim(),
        DOB: formData.DateOfBirth,
        Gender: formData.Gender,
        Mobile: formData.Phone.trim(),
        PostalAddress: formData.ResidentialAddress.trim(),
        ImagePath: formData.ProfilePath,
      };

      const response = await userAPI.updateUserProfile(profileData);

      if (response.data) {
        // Update local storage with new data
        const user = JSON.parse(localStorage.getItem("user"));
        const updatedUser = {
          ...user,
          Email: formData.Email,
          FullName: formData.FullName,
          DateOfBirth: formData.DateOfBirth,
          Gender: formData.Gender,
          Phone: formData.Phone,
          ResidentialAddress: formData.ResidentialAddress,
          ProfilePicture: previewImage || user.ProfilePicture,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setEditMode(false);
        }, 1500);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    setFormData({
      UserID: user.UserID || "",
      Username: user.Username || "",
      FullName: user.FullName || "",
      Email: user.Email || "",
      DateOfBirth: user.DateOfBirth?.split("T")[0] || "",
      Phone: user.Phone || "",
      Gender: user.Gender || "M",
      ResidentialAddress: user.ResidentialAddress || "",
      RoleName: user.RoleName || "User",
      AccountStatus: user.AccountStatus || 0,
      ProfilePath: user.ProfilePicture || "",
    });
    setPreviewImage(user.ProfilePicture || null);
    setEditMode(false);
    setError(null);
    setFormErrors({});
  };

  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h4">My Profile</Typography>
            {editMode ? (
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={submitting}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            )}
          </Box>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Profile updated successfully!
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" alignItems="center" mb={4}>
            <Avatar
              sx={{ width: 100, height: 100, mr: 3 }}
              src={previewImage || formData.ProfilePath}
            >
              {formData.FullName?.charAt(0) || formData.Username.charAt(0)}
            </Avatar>
            {editMode && (
              <Button variant="contained" component="label">
                Change Photo
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
            )}
            <Box sx={{ ml: 3 }}>
              <Typography variant="h5">{formData.FullName}</Typography>
              <Typography variant="subtitle1">@{formData.Username}</Typography>
              <Typography variant="body2">{formData.RoleName}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Username"
                value={formData.Username}
                disabled
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="FullName"
                value={formData.FullName}
                onChange={handleInputChange}
                disabled={!editMode}
                error={!!formErrors.FullName}
                helperText={formErrors.FullName}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="Email"
                value={formData.Email}
                onChange={handleInputChange}
                disabled={!editMode}
                error={!!formErrors.Email}
                helperText={formErrors.Email}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                disabled={!editMode}
                error={!!formErrors.DateOfBirth}
                helperText={formErrors.DateOfBirth}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="Phone"
                value={formData.Phone}
                onChange={handleInputChange}
                disabled={!editMode}
                error={!!formErrors.Phone}
                helperText={formErrors.Phone}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                disabled={!editMode}
                error={!!formErrors.Gender}
                size="small"
              >
                <InputLabel size="small">Gender</InputLabel>
                <Select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleInputChange}
                  label="Gender"
                  size="small"
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
                {formErrors.Gender && (
                  <Typography variant="caption" color="error" sx={{ ml: 2 }}>
                    {formErrors.Gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="ResidentialAddress"
                multiline
                rows={3}
                value={formData.ResidentialAddress}
                onChange={handleInputChange}
                disabled={!editMode}
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between">
            <Typography>
              <strong>Account Status:</strong>{" "}
              {formData.AccountStatus === 1 ? "Active" : "Inactive"}
            </Typography>
            <Typography>
              <strong>Role:</strong> {formData.RoleName}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PersonalProfileDoc;
