import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './Shared/Layout';
import { AuthProvider } from './Context/AuthContext';
import { BookProvider } from './Context/BookContext';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import BookSearch from './Pages/BookSearch';
import Favorites from './Pages/Favorites';
import BookDetails from './Pages/BookDetails';
import AddFavoriteForm from './Pages/AddFavoriteForm';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <BookProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<BookSearch />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/add-favorite" element={<AddFavoriteForm />} />



            </Routes>
          </Layout>
        </BookProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;