// src/Pages/Dashboard.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Tabs, Tab } from '@mui/material';
import { useAuth } from '../Context/AuthContext';
import { useBooks } from '../Context/BookContext';
import FavoritesQuerySearch from './FavoritesQuerySearch';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
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
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Welcome, {user?.username}</Typography>
        <Button variant="contained" color="error" onClick={logout}>
          Logout
        </Button>
      </Box>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Quick Actions" />
        <Tab label="Favorites Search" />
      </Tabs>

      {tabValue === 0 && (
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            My Favorites
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