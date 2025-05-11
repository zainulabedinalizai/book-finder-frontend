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
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { Save, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

const ChangePassword = () => {
  const { user } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPassword, setEditPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const [decryptedPasswords, setDecryptedPasswords] = useState({});
  const [decrypting, setDecrypting] = useState({});

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getUserList(-1);
        
        if (response.data?.success) {
          setAllUsers(response.data.data || []);
          // Initialize state for password visibility
          const initialVisibility = {};
          response.data.data.forEach(u => {
            initialVisibility[u.UserId] = false;
          });
          setShowPasswords(initialVisibility);
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

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const getDecryptedPassword = async (userId, encryptedPassword) => {
    if (decryptedPasswords[userId]) return; // Already decrypted
    
    try {
      setDecrypting(prev => ({ ...prev, [userId]: true }));
      const response = await userAPI.getDecryptedPassword(encryptedPassword);
      
      if (response.data?.success) {
        setDecryptedPasswords(prev => ({
          ...prev,
          [userId]: response.data.data || 'Decryption failed'
        }));
      } else {
        setError(response.data?.message || "Failed to decrypt password");
      }
    } catch (err) {
      console.error('Error decrypting password:', err);
      setError(err.message || 'Failed to decrypt password');
    } finally {
      setDecrypting(prev => ({ ...prev, [userId]: false }));
    }
  };

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
      
      if (response.data?.success || response.data?.data?.[0]?.Mesg === 'Updated') {
        setAllUsers(prevUsers => 
          prevUsers.map(u => 
            u.UserId === userId ? { ...u, PasswordHash: '••••••••' } : u
          )
        );
        setEditingId(null);
        setEditPassword('');
        setSuccess(true);
        // Reset decrypted password after update
        setDecryptedPasswords(prev => ({ ...prev, [userId]: undefined }));
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
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {showPasswords[user.UserId] ? (
                            <>
                              {decryptedPasswords[user.UserId] || (
                                <Button 
                                  size="small" 
                                  onClick={() => getDecryptedPassword(user.UserId, user.PasswordHash)}
                                  disabled={decrypting[user.UserId]}
                                >
                                  {decrypting[user.UserId] ? 'Decrypting...' : 'Decrypt Password'}
                                </Button>
                              )}
                              {decryptedPasswords[user.UserId] && (
                                <Typography component="span" sx={{ ml: 1 }}>
                                 
                                </Typography>
                              )}
                            </>
                          ) : (
                            '••••••••'
                          )}
                          <Tooltip title={showPasswords[user.UserId] ? "Hide password" : "Show password"}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                togglePasswordVisibility(user.UserId);
                                if (!showPasswords[user.UserId] && !decryptedPasswords[user.UserId]) {
                                  getDecryptedPassword(user.UserId, user.PasswordHash);
                                }
                              }}
                              sx={{ ml: 1 }}
                            >
                              {showPasswords[user.UserId] ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </Tooltip>
                        </Box>
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