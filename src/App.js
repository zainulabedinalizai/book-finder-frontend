import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Shared/Layout';
import { AuthProvider } from './Context/AuthContext';
import { BookProvider } from './Context/BookContext';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import BookSearch from './Pages/BookSearch';
import BookDetails from './Pages/BookDetails';
import AddFavoriteForm from './Pages/AddFavoriteForm';
import Register from './Pages/Register';
import PatientSurvey from './Pages/PatientSurvey';
import AddUser from './Pages/AdminDashPages/AddUser';
import PersonalProfile from './Pages/AdminDashPages/PersonalProfile';
import ChangePassword from './Pages/AdminDashPages/ChangePassword';
import UserRoles from './Pages/AdminDashPages/UserRoles';
import UserLogin from './Pages/AdminDashPages/UserLogin';
import MyRequests from './Pages/PatientPages/MyRequests';
import PersonalProfileDoc from './Pages/DoctorPages/PersonalProfileDoc';
import PersonalProfilePatient from './Pages/PatientPages/PersonalProfilePatient';
import PersonalProfilePharma from './Pages/PharmacitsPages/PersonalProfilePharma';
import PersonalProfileSaTeam from './Pages/SalesTeamPages/PersonalProfileSaTeam';
import PatientApplicationDoc from './Pages/DoctorPages/PatientApplicationDoct';
import PatientApplicationPharma from './Pages/PharmacitsPages/PatientApplicationPharma';
import PatientApplicationSales from './Pages/SalesTeamPages/PatientApplicationSales';
import AppStatsPatient from './Pages/PatientPages/AppStatsPatient';
import PrescriptionListDoc from './Pages/DoctorPages/PrescriptionListDoc';
import AddInvoicePharma from './Pages/PharmacitsPages/AddInvoicePharma';
import AddInvoiceSales from './Pages/SalesTeamPages/AttachInvoiceSales';


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
              <Route path="/PatientSurvey" element={<PatientSurvey />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/books/:id" element={<BookDetails />} />
              <Route path="/add-favorite" element={<AddFavoriteForm />} />
              
              {/* Admin Routes */}
              <Route path="/AddUser" element={<AddUser />} />      
              <Route path="/PersonalProfile" element={<PersonalProfile />} />
              <Route path="/ChangePassword" element={<ChangePassword />} />
              <Route path="/UserRoles" element={<UserRoles />} />
              <Route path="/UserLogin" element={<UserLogin />} />
              
              {/* Patient Routes */}
              <Route path="/PersonalProfilePatient" element={<PersonalProfilePatient />} />
              <Route path="/AppStatsPatient" element={<AppStatsPatient />} />
              {/* <Route path="/patient/status" element={<PatientStatus />} />
              <Route path="/patient/invoice-notifications" element={<PatientInvoiceNotifications />} />
              <Route path="/patient/download-invoice" element={<PatientDownloadInvoice />} />
              <Route path="/patient/email-notifications" element={<PatientEmailNotifications />} /> */}
              
              {/* Doctor Routes */}
              <Route path="/PersonalProfileDoc" element={<PersonalProfileDoc />} />
              <Route path="/PatientApplicationDoc" element={<PatientApplicationDoc />} />
              <Route path="/PrescriptionListDoc" element={<PrescriptionListDoc />} />
              {/* <Route path="/doctor/send-pharmacy" element={<DoctorSendPharmacy />} />  */}
              
              {/* Pharmacist Routes */}
              <Route path="/PersonalProfilePharma" element={<PersonalProfilePharma />} />
               <Route path="/PatientApplicationPharma" element={<PatientApplicationPharma />} />
              <Route path="/AddInvoicePharma" element={<AddInvoicePharma />} />
              {/* <Route path="/pharmacist/send-sales" element={<PharmacistSendSales />} />   */}
              
              {/* Sales Team Routes */}
              <Route path="/PersonalProfileSaTeam" element={<PersonalProfileSaTeam />} />
              <Route path="/PatientApplicationSales" element={<PatientApplicationSales />} />
               <Route path="/AttachInvoiceSales" element={<AddInvoiceSales />} />
              {/* <Route path="/sales/send-invoice" element={<SalesSendInvoice />} />   */}
            </Routes>
          </Layout>
        </BookProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;