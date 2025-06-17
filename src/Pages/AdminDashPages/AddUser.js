import React, { useState, useEffect } from "react";
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
  Select,
  Card,
  CardContent,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Refresh,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAuth } from "../../Context/AuthContext";
import { authService, userService } from "../../Context/authService";
import EditUserDialog from "./EditUserDialog";

const roles = [
  { id: 1, name: "User", description: "Regular authenticated user" },
  { id: 2, name: "Admin", description: "System administrator" },
  { id: 18, name: "Inventory Manager", description: "Medical supplies" },
  {
    id: 19,
    name: "Physician",
    description: "Doctors with full clinical access",
  },
  { id: 20, name: "Nurse", description: "Nursing staff" },
  { id: 21, name: "Lab Technician", description: "Diagnostic testing" },
  { id: 22, name: "Front Desk", description: "Patient registration" },
  { id: 23, name: "Billing Specialist", description: "Financial operations" },
  { id: 24, name: "Pharmacist", description: "Medication management" },
];

// Custom role colors
const roleColors = {
  1: { bg: "#e3f2fd", text: "#1565c0" }, // User - blue
  2: { bg: "#fce4ec", text: "#ad1457" }, // Admin - pink
  18: { bg: "#e8f5e9", text: "#2e7d32" }, // Inventory Manager - green
  19: { bg: "#fff3e0", text: "#e65100" }, // Physician - orange
  20: { bg: "#f3e5f5", text: "#7b1fa2" }, // Nurse - purple
  21: { bg: "#e0f7fa", text: "#00838f" }, // Lab Tech - cyan
  22: { bg: "#fff8e1", text: "#ff8f00" }, // Front Desk - amber
  23: { bg: "#f1f8e9", text: "#558b2f" }, // Billing - light green
  24: { bg: "#e8eaf6", text: "#3949ab" }, // Pharmacist - indigo
};

const AddUser = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    dob: "",
    gender: "",
    mobile: "",
    address: "",
    roleId: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [editingPasswordId, setEditingPasswordId] = useState(null);
  const [editPassword, setEditPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({});
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [decrypting, setDecrypting] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getUserList(-1);

      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          const formattedUsers = response.data.data.map((user) => ({
            UserId: user.UserId,
            Username: user.Username,
            Email: user.Email,
            FullName:
              `${user.FirstName || ""} ${user.LastName || ""}`.trim() || "N/A",
            RoleName: user.RoleName || "Unknown",
            AccountStatus: user.AccountStatus === 1 ? "Active" : "Inactive",
            RoleID: user.RoleID || 1,
            PasswordHash: user.PasswordHash || "",
          }));

          setUsers(formattedUsers);
          const initialVisibility = {};
          response.data.data.forEach((u) => {
            initialVisibility[u.UserId] = false;
          });
          setShowPasswords(initialVisibility);
        } else {
          setError(response.data?.message || "Failed to fetch users");
        }
      } else {
        setError(response.data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users. Please try again.");
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

  const togglePasswordVisibility = (userId) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const getDecryptedPassword = async (userId, encryptedPassword) => {
    if (decryptedPasswords[userId]) return;

    try {
      setDecrypting((prev) => ({ ...prev, [userId]: true }));
      const response = await userService.getDecryptedPassword(
        encryptedPassword
      );

      if (response.data?.success) {
        setDecryptedPasswords((prev) => ({
          ...prev,
          [userId]: response.data.data || "Decryption failed",
        }));
      } else {
        setError(response.data?.message || "Failed to decrypt password");
      }
    } catch (err) {
      console.error("Error decrypting password:", err);
      setError(err.message || "Failed to decrypt password");
    } finally {
      setDecrypting((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const startPasswordEdit = (userId) => {
    setEditingPasswordId(userId);
    setEditPassword("");
    setError(null);
    setPasswordSuccess(false);
  };

  const cancelPasswordEdit = () => {
    setEditingPasswordId(null);
    setEditPassword("");
  };

  const handlePasswordChange = (e) => {
    setEditPassword(e.target.value);
  };

  const savePassword = async (userId) => {
    if (!editPassword) {
      setError("Password cannot be empty");
      return;
    }

    if (editPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await userService.updatePassword(userId, editPassword);

      if (
        response.data?.success ||
        response.data?.data?.[0]?.Mesg === "Updated"
      ) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.UserId === userId ? { ...u, PasswordHash: "••••••••" } : u
          )
        );
        setEditingPasswordId(null);
        setEditPassword("");
        setPasswordSuccess(true);
        setDecryptedPasswords((prev) => ({ ...prev, [userId]: undefined }));
      } else {
        setError(response.data?.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.Username?.toLowerCase().includes(searchLower) ||
      user.Email?.toLowerCase().includes(searchLower) ||
      user.FullName?.toLowerCase().includes(searchLower) ||
      user.RoleName?.toLowerCase().includes(searchLower)
    );
  });

  const emptyRows =
    rowsPerPage -
    Math.min(rowsPerPage, filteredUsers.length - page * rowsPerPage);

  const handleEditUser = (userId) => {
    setSelectedUserId(userId);
    setOpenEditDialog(true);
  };

  const handleDeleteUser = (userId) => {
    console.log("Delete user with ID:", userId);
  };

  const handleAddUser = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewUser({
      username: "",
      email: "",
      password: "",
      fullName: "",
      dob: "",
      gender: "",
      mobile: "",
      address: "",
      roleId: "",
    });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!newUser.username) errors.username = "Username is required";
    if (!newUser.email) errors.email = "Email is required";
    if (!newUser.password) errors.password = "Password is required";
    if (!newUser.fullName) errors.fullName = "Full name is required";
    if (!newUser.dob) errors.dob = "Date of birth is required";
    if (!newUser.gender) errors.gender = "Gender is required";
    if (!newUser.mobile) errors.mobile = "Mobile number is required";
    if (!newUser.roleId) errors.roleId = "Role is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const userToSubmit = {
        ...newUser,
        roleId: Number(newUser.roleId),
      };

      const response = await authService.adminRegister({
        ...userToSubmit,
        roleID: userToSubmit.roleId,
      });

      if (response.data.success) {
        fetchUsers();
        handleCloseAddDialog();
      } else {
        setError(response.data.message || "Failed to add user");
      }
    } catch (err) {
      console.error("Error adding user:", err);
      setError(err.message || "Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 4,
              backgroundColor: "primary.main",
              color: "common.white",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mr: 3,
                backgroundColor: "primary.dark",
              }}
            >
              <PersonIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                User Management
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage system users and their permissions
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 0 }} />

          {/* Statistics Card - Top Section */}
          <Box
            sx={{
              p: 3,
              backgroundColor: "background.paper",
            }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h3" color="primary" fontWeight={600}>
                    {users.length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Active Users
                  </Typography>
                  <Typography
                    variant="h3"
                    color="success.main"
                    fontWeight={600}
                  >
                    {users.filter((u) => u.AccountStatus === "Active").length}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Admin Users
                  </Typography>
                  <Typography
                    variant="h3"
                    color="secondary.main"
                    fontWeight={600}
                  >
                    {users.filter((u) => u.RoleID === 2).length}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Main User Table */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: 3,
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 3,
              backgroundColor: "grey.100",
            }}
          >
            <Typography variant="h5" fontWeight={600}>
              User List
            </Typography>
            <Box>
              <Tooltip title="Refresh">
                <IconButton
                  onClick={fetchUsers}
                  sx={{
                    backgroundColor: "action.hover",
                    "&:hover": { backgroundColor: "action.selected" },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                sx={{
                  ml: 2,
                  px: 3,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "action.active" }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
              sx={{ mb: 3 }}
            />

            {loading && users.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 4,
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <CircularProgress size={50} />
                <Typography variant="h6" sx={{ ml: 3 }}>
                  Loading user data...
                </Typography>
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: 1,
                }}
                icon={<CancelIcon fontSize="inherit" />}
              >
                <Typography variant="h6">{error}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  sx={{
                    mt: 2,
                    borderRadius: 2,
                    px: 3,
                  }}
                  onClick={fetchUsers}
                >
                  Retry
                </Button>
              </Alert>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 2 }}
              >
                <Table>
                  <TableHead
                    sx={{
                      backgroundColor: "grey.100",
                      "& .MuiTableCell-root": {
                        fontWeight: 700,
                        fontSize: "0.95rem",
                      },
                    }}
                  >
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
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((user) => (
                        <TableRow
                          key={user.UserId}
                          hover
                          sx={{ "&:last-child td": { borderBottom: 0 } }}
                        >
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  mr: 2,
                                  width: 36,
                                  height: 36,
                                  bgcolor: "primary.main",
                                  color: "primary.contrastText",
                                }}
                              >
                                {user.FullName?.charAt(0) || "U"}
                              </Avatar>
                              <Typography fontWeight={500}>
                                {user.FullName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.Username}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <EmailIcon color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {user.Email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.RoleName}
                              sx={{
                                backgroundColor:
                                  roleColors[user.RoleID]?.bg || "#f5f5f5",
                                color:
                                  roleColors[user.RoleID]?.text || "#616161",
                                fontWeight: 600,
                                minWidth: 100,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={user.AccountStatus}
                              color={
                                user.AccountStatus === "Active"
                                  ? "success"
                                  : "error"
                              }
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {editingPasswordId === user.UserId ? (
                                <>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="primary"
                                    onClick={() => savePassword(user.UserId)}
                                    disabled={loading}
                                    startIcon={<SaveIcon />}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: "none",
                                      px: 2,
                                    }}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    onClick={cancelPasswordEdit}
                                    disabled={loading}
                                    sx={{
                                      borderRadius: 2,
                                      textTransform: "none",
                                      px: 2,
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Tooltip title="Edit">
                                    <IconButton
                                      color="primary"
                                      onClick={() =>
                                        handleEditUser(user.UserId)
                                      }
                                      sx={{
                                        backgroundColor: "action.hover",
                                        "&:hover": {
                                          backgroundColor: "primary.light",
                                          color: "common.white",
                                        },
                                      }}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Delete">
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        handleDeleteUser(user.UserId)
                                      }
                                      sx={{
                                        backgroundColor: "action.hover",
                                        "&:hover": {
                                          backgroundColor: "error.light",
                                          color: "common.white",
                                        },
                                      }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={7} />
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
                  sx={{ borderTop: "1px solid", borderColor: "divider" }}
                />
              </TableContainer>
            )}
          </Box>

          {passwordSuccess && (
            <Alert
              severity="success"
              sx={{
                m: 3,
                borderRadius: 2,
                boxShadow: 1,
              }}
              icon={<CheckCircleIcon fontSize="inherit" />}
            >
              Password updated successfully!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            overflow: "hidden",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            fontWeight: 600,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                mr: 2,
                backgroundColor: "primary.dark",
              }}
            >
              <Add sx={{ fontSize: 24 }} />
            </Avatar>
            Add New User
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 4 }}>
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
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
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
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
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
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 },
                }}
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
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 },
                }}
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
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                size="small"
                error={!!formErrors.gender}
                sx={{ mb: 2 }}
              >
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  name="gender"
                  value={newUser.gender}
                  onChange={handleInputChange}
                  sx={{ borderRadius: 2 }}
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
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                size="small"
                error={!!formErrors.roleId}
                sx={{ mb: 2 }}
              >
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  name="roleId"
                  value={newUser.roleId}
                  onChange={handleInputChange}
                  sx={{ borderRadius: 2 }}
                >
                  {roles.map((role) => (
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
                size="small"
                InputProps={{
                  sx: { borderRadius: 2 },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}
        >
          <Button
            onClick={handleCloseAddDialog}
            variant="outlined"
            color="primary"
            sx={{
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              px: 3,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Add User"}
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
