import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { AccountCircle, Groups, Home } from '@mui/icons-material';
import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.tsx';

type AppBarsWrapperProps = {
  children: ReactNode;
};

export default function AppBarsWrapper({ children }: AppBarsWrapperProps) {
  const [value, setValue] = useState(0);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Button
            size="large"
            color="inherit"
            aria-label="home"
            sx={{ textTransform: 'none', margin: '2px 0 2px 0' }}
            onClick={() => {
              setValue(0);
              navigate('/home');
            }}
          >
            <Home fontSize="large" sx={{ mr: 2 }} />
            <Typography variant="h4" component="div">
              TerminPilot
            </Typography>
          </Button>
          <Tooltip title="Account settings">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={handleMenu}
              sx={{ marginLeft: 'auto' }}
            >
              <AccountCircle />
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={() => {
                handleClose();
              }}
            >
              Settings
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleLogout().then();
                handleClose();
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <div style={{ height: '100%', overflowY: 'auto' }}>{children}</div>
      <Paper sx={{ position: 'sticky', bottom: 0 }} elevation={6}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label="Home" icon={<Home />} onClick={() => navigate('/home')} />
          <BottomNavigationAction label="Soziales" icon={<Groups />} />
        </BottomNavigation>
      </Paper>
    </div>
  );
}
