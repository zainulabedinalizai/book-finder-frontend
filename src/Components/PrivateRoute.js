// ... other imports
import { Navigate, Route, Router, Routes } from 'react-router-dom';
import PersonalProfilePatient from '../Pages/PatientPages/PersonalProfilePatient';
import PrivateRoute from './Components/PrivateRoute';
import AddUser from '../Pages/AdminDashPages/AddUser';
import Register from '../Pages/Register';
import Login from '../Pages/Login';
import { BookProvider } from '../Context/BookContext';
import { AuthProvider } from '../Context/AuthContext';
import Layout from '../Shared/Layout';
import PersonalProfileDoc from '../Pages/DoctorPages/PersonalProfileDoc';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <BookProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
              
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* Public Routes */}
              {/* <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/search" element={<BookSearch />} />
              <Route path="/books/:id" element={<BookDetails />} /> */}
              
              {/* Admin Routes */}
              <Route 
                path="/AddUser" 
                element={
                  <PrivateRoute allowedRoles={[2]}>
                    <AddUser />
                  </PrivateRoute>
                } 
              />
              
              {/* Patient Routes */}
              <Route 
                path="/PersonalProfilePatient" 
                element={
                  <PrivateRoute allowedRoles={[1]}>
                    <PersonalProfilePatient />
                  </PrivateRoute>
                } 
              />
              
              {/* Doctor Routes */}
              <Route 
                path="/PersonalProfileDoc" 
                element={
                  <PrivateRoute allowedRoles={[19]}>
                    <PersonalProfileDoc />
                  </PrivateRoute>
                } 
              />
              
              {/* Add other protected routes similarly */}
              
            </Routes>
          </Layout>
        </BookProvider>
      </AuthProvider>
    </Router>
  );
};