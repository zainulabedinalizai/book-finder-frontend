import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Fade,
  InputAdornment,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  AccountCircle,
  Email,
  Lock,
  Person,
  Cake,
  Phone,
  Home
} from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    dob: '',
    gender: '',
    mobile: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!userData.username || !userData.password || !userData.email) {
      setError('Required fields are missing');
      setLoading(false);
      return;
    }

    try {
      const result = await register(userData);
      if (result.success) {
        navigate('/login');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        minHeight: '100vh',
        px: isMobile ? 1 : 3,
        py: isMobile ? 0 : 4
      }}
    >
      <Fade in={true}>
        <Paper 
          elevation={isMobile ? 0 : 3} 
          sx={{ 
            p: isMobile ? 2 : 3, 
            width: '100%', 
            borderRadius: isMobile ? 0 : 2,
            boxShadow: isMobile ? 'none' : undefined
          }}
        >
          <Box sx={{ mb: isMobile ? 2 : 3, textAlign: 'center' }}>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
              Create Account
            </Typography>
            <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
              Join us today
            </Typography>
          </Box>

          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2, 
                p: 1,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                backgroundColor: 'error.light',
                borderRadius: 1,
                textAlign: 'center'
              }}
            >
              {error}
            </Typography>
          )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: isMobile ? 1.5 : 2 
            }}
          >
            <TextField
              required
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Full Name"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Date of Birth"
              name="dob"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={userData.dob}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Cake fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth size={isMobile ? "small" : "medium"}>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={userData.gender}
                label="Gender"
                onChange={handleChange}
              >
                <MenuItem value="M">Male</MenuItem>
                <MenuItem value="F">Female</MenuItem>
                <MenuItem value="O">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Phone Number"
              name="mobile"
              value={userData.mobile}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size={isMobile ? "small" : "medium"}
              label="Address"
              name="address"
              multiline
              rows={isMobile ? 2 : 3}
              value={userData.address}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home fontSize={isMobile ? "small" : "medium"} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size={isMobile ? "medium" : "large"}
              disabled={loading}
              sx={{ 
                mt: 1, 
                py: isMobile ? 0.75 : 1,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>

            <Typography 
              variant={isMobile ? "caption" : "body2"} 
              sx={{ 
                textAlign: 'center', 
                mt: 1,
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}
            >
              Already have an account?{' '}
              <Link 
                to="/login" 
                style={{ 
                  textDecoration: 'none', 
                  color: '#1976d2',
                  fontWeight: 500
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default Register;