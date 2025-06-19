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
  useMediaQuery,
  useTheme,
  Stack,
} from "@mui/material";
import { Edit, Save, Cancel } from "@mui/icons-material";
import { userAPI } from "../../Api/api";
import { useAuth } from "../../Context/AuthContext";

const PersonalProfilePatient = () => {
  const { user: authUser } = useAuth();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
    if (authUser) {
      setFormData({
        UserID: authUser.UserId || "",
        Username: authUser.Username || "",
        FullName: authUser.FullName || "",
        Email: authUser.Email || "",
        DateOfBirth: authUser.DateOfBirth?.split("T")[0] || "",
        Phone: authUser.Phone || "",
        Gender: authUser.Gender || "M",
        ResidentialAddress: authUser.ResidentialAddress || "",
        RoleName: authUser.RoleName || "",
        AccountStatus: authUser.AccountStatus || 0,
        ProfilePath: authUser.ProfilePicture || "",
      });

      if (authUser.ProfilePicture) {
        setPreviewImage(authUser.ProfilePicture);
      }
    }
  }, [authUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);

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

      // Use UserID from context instead of formData
      const userId = authUser?.UserId;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const profileData = {
        UserID: userId, // Use the UserID from context
        Email: formData.Email.trim(),
        FullName: formData.FullName.trim(),
        DOB: formData.DateOfBirth,
        Gender: formData.Gender,
        Mobile: formData.Phone.trim(),
        PostalAddress: formData.ResidentialAddress.trim(),
        ImagePath: formData.ProfilePath,
      };

      const formDataToSend = new FormData();
      formDataToSend.append("UserID", userId.toString());
      formDataToSend.append("Email", profileData.Email);
      formDataToSend.append("FullName", profileData.FullName);
      formDataToSend.append("DOB", profileData.DOB);
      formDataToSend.append("Gender", profileData.Gender);
      formDataToSend.append("Mobile", profileData.Mobile);
      formDataToSend.append("PostalAddress", profileData.PostalAddress);

      if (profileData.ImagePath instanceof File) {
        formDataToSend.append("ImagePath", profileData.ImagePath);
      } else if (profileData.ImagePath) {
        formDataToSend.append("ImagePath", profileData.ImagePath);
      }

      console.log("FormData contents:");
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      const response = await userAPI.updateUserProfile(formDataToSend);

      if (response.data) {
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
    <Container maxWidth="md" sx={{ p: isSmallScreen ? 1 : 3 }}>
      <Card>
        <CardContent>
          <Stack
            direction={isSmallScreen ? "column" : "row"}
            justifyContent="space-between"
            alignItems={isSmallScreen ? "flex-start" : "center"}
            spacing={1}
            mb={3}
          >
            <Typography variant={isSmallScreen ? "h5" : "h4"}>
              My Profile
            </Typography>
            {editMode ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={submitting}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  {submitting ? <CircularProgress size={24} /> : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  disabled={submitting}
                  size={isSmallScreen ? "small" : "medium"}
                >
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
                size={isSmallScreen ? "small" : "medium"}
              >
                Edit Profile
              </Button>
            )}
          </Stack>

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

          <Stack
            direction={isSmallScreen ? "column" : "row"}
            alignItems={isSmallScreen ? "center" : "flex-start"}
            spacing={2}
            mb={4}
          >
            <Avatar
              sx={{
                width: isSmallScreen ? 80 : 100,
                height: isSmallScreen ? 80 : 100,
              }}
              src={previewImage || formData.ProfilePath}
            >
              {formData.FullName?.charAt(0) || formData.Username.charAt(0)}
            </Avatar>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isSmallScreen ? "center" : "flex-start",
                textAlign: isSmallScreen ? "center" : "left",
              }}
            >
              <Typography variant={isSmallScreen ? "h6" : "h5"}>
                {formData.FullName}
              </Typography>
              <Typography variant="subtitle1">@{formData.Username}</Typography>
              <Typography variant="body2">{formData.RoleName}</Typography>
              {editMode && (
                <Button
                  variant="contained"
                  component="label"
                  size={isSmallScreen ? "small" : "medium"}
                  sx={{ mt: 1 }}
                >
                  Change Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={isSmallScreen ? 1 : 3}>
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
                rows={isSmallScreen ? 2 : 3}
                value={formData.ResidentialAddress}
                onChange={handleInputChange}
                disabled={!editMode}
                size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Stack
            direction={isSmallScreen ? "column" : "row"}
            justifyContent="space-between"
            spacing={1}
          >
            <Typography variant="body2">
              <strong>Account Status:</strong>{" "}
              {formData.AccountStatus === 1 ? "Active" : "Inactive"}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> {formData.RoleName}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PersonalProfilePatient;
