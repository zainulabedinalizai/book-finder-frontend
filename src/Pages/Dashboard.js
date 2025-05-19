import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip
} from '@mui/material';
import { 
  MedicalServices,
  People,
  CalendarToday,
  LocalHospital,
  Assignment,
  Notifications,
  Favorite
} from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext';
import { useBooks } from '../Context/BookContext';
import FavoritesQuerySearch from './FavoritesQuerySearch';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { getFavorites } = useBooks();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  // Dummy medical data
  const [appointments, setAppointments] = useState([
    { id: 1, patient: 'John Doe', date: '2023-06-15', time: '10:00 AM', type: 'Checkup', status: 'confirmed' },
    { id: 2, patient: 'Jane Smith', date: '2023-06-16', time: '2:30 PM', type: 'Follow-up', status: 'pending' },
    { id: 3, patient: 'Robert Johnson', date: '2023-06-17', time: '9:15 AM', type: 'Consultation', status: 'confirmed' },
  ]);

  const [stats, setStats] = useState({
    patients: 124,
    appointments: 18,
    prescriptions: 42,
    revenue: '$12,840'
  });

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New lab results available', time: '2 hours ago', read: false },
    { id: 2, message: 'Patient survey completed', time: '1 day ago', read: true },
    { id: 3, message: 'System maintenance scheduled', time: '3 days ago', read: true },
  ]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getFavorites();
    }
  }, [isAuthenticated, navigate, getFavorites]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #1976d2, #2196f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Medical Dashboard
        </Typography>
        <Box display="flex" alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">Welcome back,</Typography>
            <Typography variant="h6">{user?.username}</Typography>
          </Box>
        </Box>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2
          }
        }}
      >
        <Tab label="Overview" icon={<MedicalServices />} iconPosition="start" />
        <Tab label="Patients" icon={<People />} iconPosition="start" />
        <Tab label="Appointments" icon={<CalendarToday />} iconPosition="start" />
      </Tabs>

      {tabValue === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Patients" 
                value={stats.patients} 
                icon={<People fontSize="large" />} 
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Today's Appointments" 
                value={stats.appointments} 
                icon={<CalendarToday fontSize="large" />} 
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Prescriptions" 
                value={stats.prescriptions} 
                icon={<Assignment fontSize="large" />} 
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Monthly Revenue" 
                value={stats.revenue} 
                icon={<LocalHospital fontSize="large" />} 
                color="#9c27b0"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Upcoming Appointments</Typography>
                  <Button size="small" onClick={() => setTabValue(2)}>View All</Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Patient</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.slice(0, 3).map((appt) => (
                        <TableRow key={appt.id}>
                          <TableCell>{appt.patient}</TableCell>
                          <TableCell>{appt.date} {appt.time}</TableCell>
                          <TableCell>{appt.type}</TableCell>
                          <TableCell>
                            <Chip 
                              label={appt.status} 
                              size="small" 
                              color={appt.status === 'confirmed' ? 'success' : 'warning'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                  <IconButton size="small">
                    <Notifications />
                  </IconButton>
                </Box>
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {notifications.map((note) => (
                    <Box 
                      key={note.id} 
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        borderRadius: 1,
                        backgroundColor: note.read ? 'transparent' : 'action.hover',
                        borderLeft: note.read ? 'none' : '4px solid #1976d2'
                      }}
                    >
                      <Typography variant="body2">{note.message}</Typography>
                      <Typography variant="caption" color="text.secondary">{note.time}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              startIcon={<Assignment />}
              onClick={() => navigate('/PatientSurvey')}
              sx={{ mr: 2 }}
            >
              Patient Form
            </Button>

          </Box>
        </>
      )}

      {tabValue === 1 && <FavoritesQuerySearch />}

      {tabValue === 2 && (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>All Appointments</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.id}>
                    <TableCell>{appt.patient}</TableCell>
                    <TableCell>{appt.date} {appt.time}</TableCell>
                    <TableCell>{appt.type}</TableCell>
                    <TableCell>
                      <Chip 
                        label={appt.status} 
                        size="small" 
                        color={appt.status === 'confirmed' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small">Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

// StatCard component for dashboard metrics
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ 
    height: '100%', 
    borderLeft: `4px solid ${color}`,
    transition: 'transform 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)'
    }
  }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>{value}</Typography>
        </Box>
        <Avatar sx={{ bgcolor: `${color}20`, color }}>
          {icon}
        </Avatar>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={75} 
        sx={{ 
          mt: 2, 
          height: 6, 
          borderRadius: 3,
          backgroundColor: `${color}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color
          }
        }} 
      />
    </CardContent>
  </Card>
);

export default Dashboard;