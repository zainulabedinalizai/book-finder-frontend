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
  Tooltip,
  Chip,
  InputAdornment
} from '@mui/material';
import { 
  Save as SaveIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Key as KeyIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

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
    if (decryptedPasswords[userId]) return;
    
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
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ ml: 3 }}>Loading user data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert 
          severity="error" 
          sx={{ 
            mt: 3,
            borderRadius: 2,
            boxShadow: 1
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
              px: 3
            }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (allUsers.length === 0) {
    return (
      <Container maxWidth="md">
        <Alert 
          severity="warning" 
          sx={{ 
            mt: 3,
            borderRadius: 2,
            boxShadow: 1
          }}
        >
          No user data available
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Card sx={{ 
        borderRadius: 4,
        boxShadow: 3,
        overflow: 'hidden'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 4,
            backgroundColor: 'primary.main',
            color: 'common.white'
          }}>
            <Avatar sx={{ 
              width: 80, 
              height: 80, 
              mr: 3, 
              backgroundColor: 'primary.dark'
            }}>
              <LockIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                Password Management
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Manage and update user passwords securely
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 0 }} />

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
            <Table>
              <TableHead sx={{ 
                backgroundColor: 'grey.100',
                '& .MuiTableCell-root': {
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }
              }}>
                <TableRow>
                  <TableCell sx={{ width: '25%' }}>User</TableCell>
                  <TableCell sx={{ width: '25%' }}>Email</TableCell>
                  <TableCell sx={{ width: '30%' }}>Password</TableCell>
                  <TableCell sx={{ width: '20%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow 
                    key={user.UserId}
                    hover
                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ 
                          width: 36, 
                          height: 36, 
                          mr: 2,
                          bgcolor: 'secondary.main'
                        }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography fontWeight={500}>
                          {user.FullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {user.Email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {editingId === user.UserId ? (
                        <TextField
                          type="password"
                          value={editPassword}
                          onChange={handlePasswordChange}
                          size="small"
                          fullWidth
                          placeholder="Enter new password"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <KeyIcon color="action" />
                              </InputAdornment>
                            ),
                            sx: { borderRadius: 2 }
                          }}
                        />
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {showPasswords[user.UserId] ? (
                            <>
                              {decryptedPasswords[user.UserId] ? (
                                <Chip
                                  label={decryptedPasswords[user.UserId]}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              ) : (
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  onClick={() => getDecryptedPassword(user.UserId, user.PasswordHash)}
                                  disabled={decrypting[user.UserId]}
                                  startIcon={decrypting[user.UserId] ? 
                                    <CircularProgress size={16} /> : 
                                    <KeyIcon fontSize="small" />
                                  }
                                  sx={{ 
                                    borderRadius: 2,
                                    textTransform: 'none'
                                  }}
                                >
                                  {decrypting[user.UserId] ? 'Decrypting' : 'Decrypt'}
                                </Button>
                              )}
                            </>
                          ) : (
                            <Chip
                              label="••••••••"
                              size="small"
                              sx={{ 
                                backgroundColor: 'grey.100',
                                color: 'text.secondary'
                              }}
                            />
                          )}
                          <Tooltip 
                            title={showPasswords[user.UserId] ? "Hide password" : "Show password"}
                            arrow
                          >
                            <IconButton
                              size="small"
                              onClick={() => {
                                togglePasswordVisibility(user.UserId);
                                if (!showPasswords[user.UserId] && !decryptedPasswords[user.UserId]) {
                                  getDecryptedPassword(user.UserId, user.PasswordHash);
                                }
                              }}
                              sx={{ 
                                ml: 1,
                                '&:hover': {
                                  backgroundColor: 'primary.light',
                                  color: 'common.white'
                                }
                              }}
                            >
                              {showPasswords[user.UserId] ? 
                                <VisibilityOffIcon fontSize="small" /> : 
                                <VisibilityIcon fontSize="small" />
                              }
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === user.UserId ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => savePassword(user.UserId)}
                            disabled={loading}
                            startIcon={<SaveIcon />}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              px: 2
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={cancelEditing}
                            disabled={loading}
                            sx={{ 
                              borderRadius: 2,
                              textTransform: 'none',
                              px: 2
                            }}
                          >
                            Cancel
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          onClick={() => startEditing(user.UserId)}
                          startIcon={<LockIcon fontSize="small" />}
                          sx={{ 
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2
                          }}
                        >
                          Change
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                m: 3,
                borderRadius: 2,
                boxShadow: 1
              }}
              icon={<CheckCircleIcon fontSize="inherit" />}
            >
              Password updated successfully!
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ChangePassword;