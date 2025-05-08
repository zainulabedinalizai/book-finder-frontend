import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { userAPI } from '../../Api/api';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Divider
} from '@mui/material';
import { Save, Lock } from '@mui/icons-material';

const ChangePassword = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserList(-1);
        
        if (response.data?.success) {
          setAllUsers(response.data.data || []);
        } else {
          setError(response.data?.message || "Failed to fetch users");
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, []);

  const startEditing = (userId) => {
    setEditingId(userId);
    setEditPassword('');
    setError(null);
    setSuccess(false);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPassword('');
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
      
      const response = await userAPI.updatePassword(userId, editPassword);
      
      // Check for both possible success indicators from API
      if (response.data?.success || response.data?.data?.[0]?.Mesg === 'Updated') {
        setAllUsers(prevUsers => 
          prevUsers.map(u => 
            u.UserId === userId ? { ...u, PasswordHash: '••••••••' } : u
          )
        );
        setEditingId(null);
        setEditPassword('');
        setSuccess(true);
      } else {
        setError(response.data?.message || "Failed to update password");
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (loading && allUsers.length === 0) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>Loading user data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Container>
    );
  }

  if (allUsers.length === 0) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning" sx={{ mt: 3 }}>
          No user data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
              <Lock fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h4">User Password Management</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Update user passwords
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Password</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.UserId}>
                    <TableCell>{user.FullName}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>
                      {editingId === user.UserId ? (
                        <TextField
                          type="password"
                          value={editPassword}
                          onChange={handlePasswordChange}
                          size="small"
                          fullWidth
                          placeholder="Enter new password"
                        />
                      ) : (
                        '••••••••'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user.UserId ? (
                        <>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => savePassword(user.UserId)}
                            disabled={loading}
                            startIcon={<Save />}
                            sx={{ mr: 1 }}
                          >
                            Update
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={cancelEditing}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => startEditing(user.UserId)}
                          startIcon={<Lock />}
                        >
                          Change Password
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password updated successfully!
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ChangePassword;