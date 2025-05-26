import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Container,
  Paper,
  Fade,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grow,
  Slide,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff,
  AccountCircle,
  Lock
} from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      return;
    }

    try {
      const result = await login(credentials);
      if (result?.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center',
        px: isMobile ? 2 : 4,
        py: isMobile ? 0 : 4
      }}
    >
      <Fade in={true} timeout={500}>
        <Paper 
          elevation={isMobile ? 0 : 6} 
          sx={{
            p: isMobile ? 3 : 4,
            borderRadius: isMobile ? 0 : 3,
            width: '100%',
            background: isMobile ? 'transparent' : 'linear-gradient(145deg, #ffffff, #f5f5f5)',
            boxShadow: isMobile ? 'none' : '0 8px 32px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              boxShadow: isMobile ? 'none' : '0 12px 40px rgba(0,0,0,0.15)'
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: isMobile ? 2 : 4
          }}>
            <Grow in={true} timeout={800}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center'
                }}
              >
                Welcome Back
              </Typography>
            </Grow>
            <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary">
              Sign in to access your account
            </Typography>
          </Box>

          {error && (
            <Slide in={!!error} direction="down" timeout={300}>
              <Typography 
                color="error" 
                sx={{ 
                  mb: 2,
                  p: 1.5,
                  borderRadius: 1,
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                {error}
              </Typography>
            </Slide>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              size={isMobile ? "small" : "medium"}
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle color="primary" fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  transition: 'all 0.3s ease',
                },
                mb: 2
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              size={isMobile ? "small" : "medium"}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      size={isMobile ? "small" : "medium"}
                    >
                      {showPassword ? <VisibilityOff fontSize={isMobile ? "small" : "medium"} /> : <Visibility fontSize={isMobile ? "small" : "medium"} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#1976d2',
                  },
                  transition: 'all 0.3s ease',
                },
                mb: 2
              }}
            />

            <Box
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: !isMobile ? 'scale(1.01)' : 'none'
                },
                '&:active': {
                  transform: !isMobile ? 'scale(0.99)' : 'scale(0.98)'
                }
              }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size={isMobile ? "medium" : "large"}
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: isMobile ? 1 : 1.5,
                  borderRadius: 2,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0, #1e88e5)',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 1 : 0,
              mt: 2
            }}>
              <Typography variant="body2" sx={{ mb: isMobile ? 1 : 0 }}>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    textDecoration: 'none',
                    color: '#1976d2',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#1565c0'
                    }
                  }}
                >
                  Forgot password?
                </Link>
              </Typography>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  style={{ 
                    textDecoration: 'none',
                    color: '#1976d2',
                    fontWeight: 500,
                    transition: 'color 0.2s ease',
                    '&:hover': {
                      color: '#1565c0'
                    }
                  }}
                >
                  Register
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default Login;