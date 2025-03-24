import { ReactNode, useState } from 'react';
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
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';

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
  [theme.breakpoints.up('sm')]: {
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems: NavItem[] = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'My Family', path: '/my-family', icon: <FamilyRestroomIcon /> },
    { text: 'Families', path: '/families', icon: <PeopleIcon /> },
    { text: 'School Years', path: '/years', icon: <DateRangeIcon /> },
    { text: 'Users', path: '/users', icon: <PersonIcon /> },
  ];

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', position: 'relative' }}>
      <List sx={{ mt: 8 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
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
      </List>
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
          <Avatar sx={{ mr: 2 }} />
          <Typography variant="body2">User Profile</Typography>
        </Box>
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
          sx={{
            flexGrow: 1,
            width: '100%',
            maxWidth: {
              xs: '100%',
              sm: '100%',
              md: '900px',
              lg: '1100px',
            },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {children}
        </Container>
      </MainContent>
    </AppRoot>
  );
}

export default Layout;
