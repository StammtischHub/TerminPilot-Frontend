import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#048BA8' },
    secondary: { main: '#2B3A67' },
    background: { default: '#EAE5F0' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#DFDAE6',
          borderRadius: '8px 8px 0 0',
          '&:hover': { backgroundColor: '#D6D0DE' },
        },
      },
    },
  },
});
