import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Tabs, Tab, Container } from '@mui/material';
import { useAuth } from '../Context/AuthContext';
import { useBooks } from '../Context/BookContext';
import FavoritesQuerySearch from './FavoritesQuerySearch';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { getFavorites } = useBooks();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

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
        <Typography variant="h4">Welcome, {user?.username}</Typography>
      </Box>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Quick Actions" />
        <Tab label="Favorites Search" />
      </Tabs>

      {tabValue === 0 && (
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', sm: 'flex-start' }
        }}>
          <Button 
            variant="contained" 
            onClick={() => navigate('/search')}
            sx={{ mt: 2 }}
          >
            Search Books
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/favorites')}
            sx={{ mt: 2 }}
          >
            Patient Form
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/add-favorite')}
            sx={{ mt: 2 }}
          >
            Add New Favorite
          </Button>
        </Box>
      )}

      {tabValue === 1 && <FavoritesQuerySearch />}
    </Container>
  );
};

export default Dashboard;