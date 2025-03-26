import { useEffect } from 'react';
import { Box, Typography, Container, Grid, Card, CardContent, CardActions, CardMedia, Button } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useBooks } from '../Context/BookContext';

const Favorites = () => {
  const { favorites, loading, error, getFavorites, removeFavorite } = useBooks();

  useEffect(() => {
    getFavorites();
  }, []);
  const handleRemove = async (id) => {
    await removeFavorite(id);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        My Favorite Books
      </Typography>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Grid container spacing={3}>
        {favorites.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.id}>
            <Card>
              {book.coverImageUrl && (
                <CardMedia
                  height="140"
                  image={book.coverImageUrl}
                  alt={book.title}
                />
              )}
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {book.author}
                </Typography>
                {/* Add this line to display the book ID */}
                <Typography variant="caption" color="text.secondary">
                  ID: {book.bookId}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="error"
                  startIcon={<Favorite />}
                  onClick={() => removeFavorite(book.bookId)}  
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Favorites;