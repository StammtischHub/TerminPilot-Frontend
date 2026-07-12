import {
  AppBar, BottomNavigation, BottomNavigationAction, Button,
  IconButton, Paper,
  Toolbar,
  Typography
} from "@mui/material";
import {AccountCircle, Groups, Home} from "@mui/icons-material";
import {type ReactNode, useState} from "react";

type AppBarsWrapperProps = {
  children: ReactNode;
}

export default function AppBarsWrapper({ children }: AppBarsWrapperProps) {
  const [value, setValue] = useState(0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100vh'}}>
      <AppBar position="sticky" >
        <Toolbar>
          <Button
            size="large"
            color="inherit"
            aria-label="home"
            sx={{textTransform: 'none', margin: '2px 0 2px 0'}}
            onClick={() => {
              setValue(0);
            }}
          >
            <Home fontSize="large" sx={{mr: 2}} />
            <Typography variant="h4" component="div">
              TerminPilot
            </Typography>
          </Button>
          <IconButton
            size="large"
            aria-label="account of current user"
            color="inherit"
            sx={{marginLeft: 'auto'}}
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={{height: '100%', overflowY: 'auto' }}>
        {children}
      </div>
      <Paper sx={{ position: 'sticky', bottom: 0}} elevation={6}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction label="Home" icon={<Home />} />
          <BottomNavigationAction label="Soziales" icon={<Groups />} />
        </BottomNavigation>
      </Paper>
    </div>
  );
}
