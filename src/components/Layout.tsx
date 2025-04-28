import { ReactNode, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import TuneIcon from '@mui/icons-material/Tune';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import _ from 'lodash';
import { useAuth } from '../contexts/useAuth';
import DirectoryPDFGenerator from './DirectoryPDFGenerator';
import { fetchYears } from '../services/firebase/years';
import { Year } from '../services/firebase/models/types';

const drawerWidth = 240;

// Root container for the entire app
const AppRoot = styled('div')({
  display: 'flex',
  minHeight: '100vh',
});

// Main content area
const MainContent = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.spacing(10),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.up('md')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  text: string;
  path: string;
  icon: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  // Use 'md' breakpoint instead of 'sm' to show sidebar on larger screens
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [years, setYears] = useState<Year[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAdmin, isAuthenticated, logout, myFamily } = useAuth();

  useEffect(() => {
    // Fetch years from Firebase
    const loadYears = async () => {
      try {
        const yearsList = await fetchYears();
        console.log('Years loaded:', yearsList);
        setYears(yearsList);
      } catch (error) {
        console.error('Error fetching years:', error);
      }
    };

    loadYears();
  }, []);

  // Debug information
  useEffect(() => {
    console.log('Auth state:', {
      isAdmin,
      isAuthenticated,
      currentUser,
      currentYear: _.find(years, { isAcceptingRegistrations: true }),
    });
  }, [isAdmin, isAuthenticated, currentUser, years]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Find the current active year
  const currentYear = _.find(years, { isAcceptingRegistrations: true });

  // Basic navigation items available to all authenticated users
  const navItems: NavItem[] = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'My Family', path: '/my-family', icon: <FamilyRestroomIcon /> },
  ];

  // Add registration item if user has a family
  if (myFamily) {
    navItems.push({
      text: 'Register',
      path: '/register',
      icon: <PersonIcon />,
    });
  }

  // Add admin-only items
  if (isAdmin) {
    navItems.push(
      { text: 'Families', path: '/families', icon: <PeopleIcon /> },
      { text: 'School Years', path: '/years', icon: <DateRangeIcon /> },
      { text: 'User Accounts', path: '/users', icon: <PersonIcon /> },
      { text: 'Sliding Scale Designer', path: '/sliding-scale', icon: <TuneIcon /> },
    );
  }

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', position: 'relative' }}>
      <List sx={{ mt: 8 }}>
        {navItems.map((item) => (
          <ListItem key={item.text}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Add Directory PDF Generator */}
        {isAdmin && (
          <>
            <Divider sx={{ my: 1 }} />
            {currentYear ? (
              <DirectoryPDFGenerator year={currentYear} />
            ) : (
              <ListItem>
                <ListItemText
                  primary="No active school year"
                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </>
        )}
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />

        {isAuthenticated && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Avatar
                sx={{ mr: 2 }}
                src={currentUser?.photoURL || undefined}
                alt={currentUser?.displayName || 'User Avatar'}
              />
              <Box>
                <Typography variant="body-sm" noWrap>
                  {currentUser?.displayName || currentUser?.email}
                </Typography>
                {isAdmin && (
                  <Typography variant="caption" color="primary">
                    Administrator
                  </Typography>
                )}
              </Box>
            </Box>
            <ListItem>
              <ListItemButton onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <AppRoot>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: '100%',
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div">
            VFS Admin Portal
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={isMobile ? handleDrawerToggle : undefined}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <MainContent>
        <Container
          maxWidth="xl"
          disableGutters={false}
          sx={{
            flexGrow: 1,
            py: { xs: 2 },
            px: { xs: 0 },
          }}
        >
          {children}
        </Container>
      </MainContent>
    </AppRoot>
  );
}

export default Layout;
