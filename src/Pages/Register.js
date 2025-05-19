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
  CircularProgress
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
    <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <Fade in={true}>
        <Paper elevation={3} sx={{ p: 3, width: '100%', borderRadius: 2 }}>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join us today
            </Typography>
          </Box>

          {error && (
            <Typography color="error" sx={{ 
              mb: 2, 
              p: 1,
              backgroundColor: 'error.light',
              borderRadius: 1,
              textAlign: 'center'
            }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              required
              fullWidth
              size="small"
              label="Username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              size="small"
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              required
              fullWidth
              size="small"
              label="Password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Full Name"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Date of Birth"
              name="dob"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={userData.dob}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Cake fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth size="small">
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
              size="small"
              label="Phone Number"
              name="mobile"
              value={userData.mobile}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              size="small"
              label="Address"
              name="address"
              multiline
              rows={2}
              value={userData.address}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              disabled={loading}
              sx={{ mt: 1, py: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
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