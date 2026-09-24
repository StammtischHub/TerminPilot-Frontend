import {
  AppBar,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Logout } from '@mui/icons-material';
import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext.tsx';
import { Blobatar } from '@blobatar/react';
import { useAuthedUser } from '../auth/useAuthedUser.ts';
import { isMobile } from '../utils/ThemeHelpers.ts';

type AppBarsWrapperProps = {
  children: ReactNode;
};

export default function AppBarsWrapper({ children }: AppBarsWrapperProps) {
  const mobile = useMediaQuery(isMobile);
  const navigate = useNavigate();

  const user = useAuthedUser();
  const { logout } = useAuth();

  const [useStateElement, setUseStateElement] = useState<null | HTMLElement>(null);

  const handleUserMenuClick = (target: EventTarget & HTMLButtonElement) => {
    setUseStateElement(target);
  };

  const handleUserMenuClose = () => {
    setUseStateElement(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Button
            size="large"
            color="inherit"
            aria-label="home"
            sx={{ textTransform: 'none', my: '2px' }}
            onClick={() => {
              navigate('/home');
            }}
          >
            <img src="/assets/TerminPilotWeiss.png" alt="TerminPilot Logo" style={{ width: 50 }} />
            {mobile ? null : (
              <Typography variant="h4" component="span" sx={{ ml: 2 }}>
                TerminPilot
              </Typography>
            )}
          </Button>
          <Tooltip title="Benutzer verwalten">
            <IconButton
              size="small"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={(event) => handleUserMenuClick(event.currentTarget)}
              sx={{ marginLeft: 'auto', filter: 'drop-shadow(0 0 0.5em black)' }}
            >
              <Blobatar name={user.username} width={50} />
            </IconButton>
          </Tooltip>
          <Menu
            id="menu-appbar"
            anchorEl={useStateElement}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(useStateElement)}
            onClose={handleUserMenuClose}
          >
            <MenuItem
              onClick={() => {
                handleUserMenuClose();
              }}
            >
              Einstellungen
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleUserMenuClose();
              }}
            >
              Kalendar verwalten
            </MenuItem>

            <Divider component="li" />

            <MenuItem
              onClick={() => {
                handleLogout().then(handleUserMenuClose);
              }}
            >
              <Logout fontSize="small" />
              Ausloggen
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <div style={{ height: '100%', overflowY: 'auto' }}>{children}</div>
    </div>
  );
}
