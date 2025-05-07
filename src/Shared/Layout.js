import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Divider,
  Avatar,
  styled,
  Tooltip,
  Collapse
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LoginIcon from '@mui/icons-material/Login';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import EmailIcon from '@mui/icons-material/Email';
import DescriptionIcon from '@mui/icons-material/Description';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DownloadIcon from '@mui/icons-material/Download';

const drawerWidth = 280;
const collapsedWidth = 72;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  fontSize: '1.5rem',
  padding: theme.spacing(0.5, 1),
  borderRadius: '4px',
  position: 'relative',
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -4,
    width: '100%',
    height: '2px',
    background: 'linear-gradient(90deg, #3f51b5, #2196f3)',
    borderRadius: '2px'
  }
}));

const NavItem = styled(ListItemButton)(({ theme, level = 0, selected }) => ({
  borderRadius: 2,
  mx: 1,
  my: 0.5,
  minHeight: 48,
  paddingLeft: theme.spacing(3 + level * 2),
  justifyContent: 'initial',
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  }
}));

const Layout = ({ children }) => {
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [openMenus, setOpenMenus] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const hideDrawer = ['/login', '/register'].includes(location.pathname);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopOpen(!desktopOpen);
    }
  };

  const toggleMenu = (menu) => {
    setOpenMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const adminMenuItems = [
    { text: 'Personal Profile', icon: <PersonIcon />, path: '/admin/profile' },
    { text: 'Add User', icon: <PeopleIcon />, path: '/AddUser' }, // Changed here
    { text: 'User Login', icon: <LoginIcon />, path: '/admin/user-login' },
    { text: 'User Role', icon: <LockIcon />, path: '/admin/user-role' },
    { text: 'Change Password', icon: <LockIcon />, path: '/admin/change-password' }
  ];

  const patientMenuItems = [
    { text: 'Personal Profile', icon: <PersonIcon />, path: '/patient/profile' },
    { text: 'My Request', icon: <DescriptionIcon />, path: '/patient/requests' },
    { text: 'Application Status', icon: <DescriptionIcon />, path: '/patient/status' },
    { text: 'Invoice Notification', icon: <NotificationsIcon />, path: '/patient/invoice-notifications' },
    { text: 'Download Invoice', icon: <DownloadIcon />, path: '/patient/download-invoice' },
    { text: 'Email Notifications', icon: <EmailIcon />, path: '/patient/email-notifications' }
  ];

  const doctorMenuItems = [
    { text: 'Personal Profile', icon: <PersonIcon />, path: '/doctor/profile' },
    { text: 'Patient Applications', icon: <DescriptionIcon />, path: '/doctor/applications' },
    { text: 'Prescription List', icon: <MedicalServicesIcon />, path: '/doctor/prescriptions' },
    { text: 'Send to Pharmacy', icon: <LocalPharmacyIcon />, path: '/doctor/send-pharmacy' }
  ];

  const pharmacistMenuItems = [
    { text: 'Personal Profile', icon: <PersonIcon />, path: '/pharmacist/profile' },
    { text: 'Patient Applications', icon: <DescriptionIcon />, path: '/pharmacist/applications' },
    { text: 'Add Invoice', icon: <DescriptionIcon />, path: '/pharmacist/add-invoice' },
    { text: 'Send to Sales', icon: <PointOfSaleIcon />, path: '/pharmacist/send-sales' }
  ];

  const salesMenuItems = [
    { text: 'Personal Profile', icon: <PersonIcon />, path: '/sales/profile' },
    { text: 'Patient Applications', icon: <DescriptionIcon />, path: '/sales/applications' },
    { text: 'Attach Final Invoice', icon: <DescriptionIcon />, path: '/sales/attach-invoice' },
    { text: 'Send Invoice to Patient', icon: <EmailIcon />, path: '/sales/send-invoice' }
  ];

  const renderMenuItems = (items, level = 0) => {
    return items.map((item, index) => (
      <NavItem
        key={index}
        component={Link}
        to={item.path}
        selected={location.pathname === item.path}
        level={level}
      >
        <ListItemIcon sx={{ minWidth: '40px' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.text} 
          primaryTypographyProps={{ 
            fontWeight: location.pathname === item.path ? '600' : 'normal',
            fontSize: level > 0 ? '0.875rem' : '0.9375rem'
          }} 
        />
      </NavItem>
    ));
  };

  const renderMenuSection = (title, items, icon, menuKey) => {
    const isOpen = openMenus[menuKey];
    
    return (
      <>
        <ListItemButton onClick={() => toggleMenu(menuKey)}>
          <ListItemIcon sx={{ minWidth: '40px' }}>
            {icon}
          </ListItemIcon>
          <ListItemText primary={title} />
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {renderMenuItems(items, 1)}
          </List>
        </Collapse>
      </>
    );
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}>
      <DrawerHeader>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            {desktopOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </DrawerHeader>
      
      {isAuthenticated && desktopOpen && (
        <Box sx={{ 
          px: 3, 
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar sx={{ width: 48, height: 48 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="subtitle1" noWrap>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email || 'admin@example.com'}
            </Typography>
          </Box>
        </Box>
      )}
      
      <Divider />
      
      <List sx={{ 
        flexGrow: 1,
        '& .MuiListItemButton-root': {
          borderRadius: 2,
          mx: 1,
          my: 0.5,
          minHeight: 48,
          justifyContent: desktopOpen ? 'initial' : 'center',
          px: 2.5,
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
            '& .MuiListItemIcon-root': {
              color: theme.palette.primary.main,
            },
          },
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          }
        },
        '& .MuiListItemIcon-root': {
          minWidth: 0,
          mr: desktopOpen ? 3 : 'auto',
          justifyContent: 'center',
        },
        '& .MuiListItemText-root': {
          opacity: desktopOpen ? 1 : 0,
          transition: theme.transitions.create('opacity', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }
      }}>
        {isAuthenticated ? (
          <>
            <Tooltip title="Dashboard" placement="right" arrow>
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  to="/dashboard"
                  selected={location.pathname === '/dashboard'}
                >
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dashboard" 
                    primaryTypographyProps={{ 
                      fontWeight: location.pathname === '/dashboard' ? '600' : 'normal' 
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
            
            {/* Admin Dashboard Section */}
            {renderMenuSection('Admin Dashboard', adminMenuItems, <DashboardIcon />, 'admin')}
            
            {/* Patient's Dashboard Section */}
            {renderMenuSection("Patient's Dashboard", patientMenuItems, <PersonIcon />, 'patient')}
            
            {/* Doctor's Dashboard Section */}
            {renderMenuSection("Doctor's Dashboard", doctorMenuItems, <MedicalServicesIcon />, 'doctor')}
            
            {/* Pharmacist's Dashboard Section */}
            {renderMenuSection("Pharmacist's Dashboard", pharmacistMenuItems, <LocalPharmacyIcon />, 'pharmacist')}
            
            {/* Sales Team Dashboard Section */}
            {renderMenuSection("Sales Team Dashboard", salesMenuItems, <PointOfSaleIcon />, 'sales')}
          </>
        ) : (
          <Tooltip title="Login" placement="right" arrow>
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                to="/login"
                selected={location.pathname === '/login'}
              >
                <ListItemIcon>
                  <LoginIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Login" 
                  primaryTypographyProps={{ 
                    fontWeight: location.pathname === '/login' ? '600' : 'normal' 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          </Tooltip>
        )}
      </List>
      
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            <Tooltip title="Logout" placement="right" arrow>
              <ListItem disablePadding>
                <ListItemButton onClick={logout}>
                  <ListItemIcon>
                    <ExitToAppIcon />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <AppBar 
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { 
            md: hideDrawer ? '100%' : `calc(100% - ${desktopOpen ? drawerWidth : collapsedWidth}px)` 
          },
          ml: { 
            md: hideDrawer ? 0 : `${desktopOpen ? drawerWidth : collapsedWidth}px` 
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          boxShadow: 'none',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          {!hideDrawer && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <GradientText variant="h6" noWrap component="div">
              Medskls
            </GradientText>
          </Box>
        </Toolbar>
      </AppBar>
      
      {!hideDrawer && (
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : desktopOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: isMobile ? drawerWidth : (desktopOpen ? drawerWidth : collapsedWidth),
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              borderRight: 'none',
              boxShadow: theme.shadows[2],
              backgroundColor: theme.palette.background.paper,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            md: hideDrawer ? '100%' : `calc(100% - ${desktopOpen ? drawerWidth : collapsedWidth}px)`
          },
          ml: { 
            md: hideDrawer ? 0 : `${desktopOpen ? drawerWidth : collapsedWidth}px`
          },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          height: '100vh',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default
        }}
      >
        <Toolbar />
        <Box sx={{ 
          maxWidth: 1700,
          mx: 'auto',
          my: 4,
          p: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1]
        }}>
          <Outlet />
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;