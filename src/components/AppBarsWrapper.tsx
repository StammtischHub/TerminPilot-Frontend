import {
  AppBar,
  Button, Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {AccountCircle, Logout} from '@mui/icons-material';
import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.tsx';

type AppBarsWrapperProps = {
  children: ReactNode;
};

export default function AppBarsWrapper({ children }: AppBarsWrapperProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (target: EventTarget & HTMLButtonElement) => {
    setAnchorEl(target);
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
              navigate('/home');
            }}
          >
            <img src="../../assets/TerminPilotWeiss.png" alt="TerminPilot Logo" style={{ width: 50, marginRight: 10 }} />
            <Typography variant="h4" component="div">
              TerminPilot
            </Typography>
          </Button>
          <Tooltip title="Benutzer verwalten">
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={(event) => handleMenu(event.currentTarget)}
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
              Einstellungen
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClose();
              }}
            >
              Kalendar verwalten
            </MenuItem>

            <Divider component="li" />

            <MenuItem
              onClick={() => {
                handleLogout().then();
                handleClose();
              }}
            >
              <Logout fontSize="small"/>Ausloggen
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <div style={{ height: '100%', overflowY: 'auto' }}>{children}</div>
    </div>
  );
}
