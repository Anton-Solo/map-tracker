import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { 
  CssBaseline, 
  ThemeProvider, 
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  Logout as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import MapIcon from '@mui/icons-material/Map';
import { LoginForm } from './components/Auth/LoginForm';
import { MapView } from './components/Map';
import { ObjectsList } from './components/ObjectsList';
import { useAuthStore, useObjectsStore } from './stores/RootStore';
import { type TrackedObject } from './types';

const appTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const DRAWER_WIDTH = 470;

const App = observer(() => {
  const authStore = useAuthStore();
  const objectsStore = useObjectsStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedObject, setSelectedObject] = useState<TrackedObject | null>(null);

  useEffect(() => {
    authStore.autoLogin();
  }, [authStore]);

  useEffect(() => {
    setDrawerOpen(!isMobile);
  }, [isMobile]);

  const handleObjectClick = (object: TrackedObject) => {
    setSelectedObject(object);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (!authStore.isAuthenticated) {
    return (
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <LoginForm />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>

            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <MapIcon /> Map Tracker
            </Typography>

            <Chip
              label={authStore.statusText}
              color={authStore.isAuthenticated ? 'success' : 'warning'}
              size="small"
              sx={{ mr: 2, display: { xs: 'none', sm: 'flex' } }}
            />

            <Chip
              label={`${objectsStore.totalCount}`}
              variant="outlined"
              sx={{ mr: 2, color: 'white', borderColor: 'white' }}
            />

            <IconButton
              color="inherit"
              onClick={() => authStore.logout()}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <LogoutIcon />
            </IconButton>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={() => authStore.logout()}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Вийти
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
          <Drawer
            variant={isMobile ? 'temporary' : 'persistent'}
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              width: drawerOpen && !isMobile ? DRAWER_WIDTH : 0,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: isMobile ? '100vw' : DRAWER_WIDTH,
                boxSizing: 'border-box',
                position: isMobile ? 'absolute' : 'relative',
                height: '100%',
              },
            }}
          >
            <ObjectsList onObjectClick={handleObjectClick} />
          </Drawer>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
            }}
          >
            <MapView selectedObject={selectedObject} drawerOpen={drawerOpen} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
});

export default App;
