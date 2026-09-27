import { useState, type ReactNode } from 'react';
import {
  AppBar,
  Box,
  Button,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { CalendarMonth, Logout, Settings } from '@mui/icons-material';
import { useNavigate, type NavigateFunction } from 'react-router';
import { Blobatar } from '@blobatar/react';
import { useAuth } from '../auth/AuthContext.tsx';
import { useAuthedUser } from '../auth/useAuthedUser.ts';
import { isMobile } from '../utils/ThemeHelpers.ts';

type UserMenuContext = {
  navigate: NavigateFunction;
  logout: () => Promise<void>;
};

type UserMenuEntry = {
  label: string;
  onClick: (context: UserMenuContext) => void | Promise<void>;
  icon?: ReactNode;
  /** Zeichnet unter diesem Eintrag eine Trennlinie. */
  divider?: boolean;
};

const USER_MENU_ENTRIES: UserMenuEntry[] = [
  {
    label: 'Einstellungen',
    icon: <Settings fontSize="small" />,
    onClick: ({ navigate }) => navigate('/account-settings'),
  },
  {
    label: 'Kalender verwalten',
    icon: <CalendarMonth fontSize="small" />,
    divider: true,
    onClick: ({ navigate }) => navigate('/calendar-settings'),
  },
  {
    label: 'Ausloggen',
    icon: <Logout fontSize="small" />,
    onClick: async ({ navigate, logout }) => {
      await logout();
      navigate('/', { replace: true });
    },
  },
];

const USER_MENU_ID = 'user-menu';

type AppBarsWrapperProps = {
  children: ReactNode;
};

export default function AppBarsWrapper({ children }: AppBarsWrapperProps) {
  const mobile = useMediaQuery(isMobile);
  const navigate = useNavigate();

  const user = useAuthedUser();
  const { logout } = useAuth();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(menuAnchor);

  const closeMenu = () => setMenuAnchor(null);

  const handleEntryClick = (entry: UserMenuEntry) => {
    closeMenu();
    void entry.onClick({ navigate, logout });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <AppBar position="sticky">
        <Toolbar>
          <Button
            size="large"
            color="inherit"
            aria-label="Startseite"
            sx={{ textTransform: 'none', my: '2px' }}
            onClick={() => navigate('/home')}
          >
            <img src="/assets/TerminPilotWeiss.png" alt="TerminPilot Logo" style={{ width: 50 }} />
            {!mobile && (
              <Typography variant="h4" component="span" sx={{ ml: 2 }}>
                TerminPilot
              </Typography>
            )}
          </Button>

          <Tooltip title="Benutzer verwalten">
            <IconButton
              size="small"
              aria-label="Benutzermenü öffnen"
              aria-controls={isMenuOpen ? USER_MENU_ID : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              color="inherit"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              sx={{ ml: 'auto', filter: 'drop-shadow(0 0 0.5em black)' }}
            >
              <Blobatar name={user.username} width={50} />
            </IconButton>
          </Tooltip>

          <Menu
            id={USER_MENU_ID}
            anchorEl={menuAnchor}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            open={isMenuOpen}
            onClose={closeMenu}
          >
            {USER_MENU_ENTRIES.map((entry) => (
              <MenuItem
                key={entry.label}
                divider={entry.divider}
                onClick={() => handleEntryClick(entry)}
              >
                <ListItemIcon>{entry.icon}</ListItemIcon>
                <ListItemText>{entry.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>{children}</Box>
    </Box>
  );
}
