import { useState } from 'react';
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
  Chip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  MedicalServices,
  People,
  CalendarToday,
  LocalHospital,
  Assignment,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext';
import FavoritesQuerySearch from './FavoritesQuerySearch';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ 
      mt: isMobile ? 2 : 4, 
      px: { xs: 1, sm: 3 },
      pb: 4
    }}>
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 4,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
          fontWeight: 700,
          background: 'linear-gradient(45deg, #1976d2, #2196f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Medical Dashboard
        </Typography>

      </Box>
      
      {/* Tabs Section */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant={isMobile ? "scrollable" : "standard"}
        scrollButtons="auto"
        sx={{ 
          mb: 3,
          '& .MuiTabs-indicator': {
            height: 4,
            borderRadius: 2
          }
        }}
      >
        <Tab label={isMobile ? null : "Overview"} icon={<MedicalServices />} iconPosition="start" />
        <Tab label={isMobile ? null : "Appointments"} icon={<CalendarToday />} iconPosition="start" />
      </Tabs>

      {/* Overview Tab */}
      {tabValue === 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {['Total Patients', "Today's Appointments", "Prescriptions", "Monthly Revenue"].map((title, index) => (
              <Grid item xs={12} sm={6} md={3} key={title}>
                <StatCard 
                  title={title} 
                  value="" 
                  icon={[
                    <People fontSize="large" />,
                    <CalendarToday fontSize="large" />,
                    <Assignment fontSize="large" />,
                    <LocalHospital fontSize="large" />
                  ][index]} 
                  color={[
                    "#1976d2",
                    "#4caf50",
                    "#ff9800",
                    "#9c27b0"
                  ][index]}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
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
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No upcoming appointments
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                  <IconButton size="small">
                    <Notifications />
                  </IconButton>
                </Box>
                <Box sx={{ 
                  maxHeight: 300, 
                  overflow: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 150
                }}>
                  <Typography variant="body2" color="text.secondary">
                    No new notifications
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<Assignment />}
              onClick={() => navigate('/PatientSurvey')}
              fullWidth={isMobile}
            >
              Patient Form
            </Button>
          </Box>
        </>
      )}



      {/* Appointments Tab */}
      {tabValue === 1 && (
        <Paper elevation={3} sx={{ p: isMobile ? 1 : 3, borderRadius: 2 }}>
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
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No appointments scheduled
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

// StatCard component for dashboard metrics
const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
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
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
              {value || '-'}
            </Typography>
          </Box>
          <Avatar sx={{ 
            bgcolor: `${color}20`, 
            color,
            width: isMobile ? 40 : 56,
            height: isMobile ? 40 : 56
          }}>
            {icon}
          </Avatar>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={0} 
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
};

export default Dashboard;