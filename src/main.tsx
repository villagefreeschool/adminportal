import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import './index.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    // Adding custom palette colors used in the application
    green: {
      900: '#1b5e20', // Dark green for headers
      800: '#2e7d32', // Lighter green for buttons
    },
    brown: {
      700: '#5d4037', // Darker brown for hover
      500: '#795548', // Brown for buttons/accents
    },
    grey: {
      500: '#9e9e9e', // For inactive headers
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
