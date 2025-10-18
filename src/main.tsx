import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const theme = createTheme({
  palette: {
    primary: {
      main: "#5E5047", // Dark brown from Vuetify theme
      dark: "#3a3631", // Darker version for hover states
      light: "#625d56", // Lighter version
    },
    secondary: {
      main: "#8a9b0f", // Green from Vuetify theme
      dark: "#697500", // Darker version for hover states
      light: "#a1b52c", // Lighter version
    },
    error: {
      main: "#FF5252",
    },
    info: {
      main: "#2196F3",
    },
    success: {
      main: "#4CAF50",
    },
    warning: {
      main: "#FFC107",
    },
    green: {
      800: "#2e7d32", // Matches MUI's green.800
      900: "#1b5e20", // For section headers (dark green)
    },
    brown: {
      500: "#795548", // For secondary buttons
      700: "#5d4037", // For secondary button hover state
    },
    grey: {
      100: "#f5f5f5", // For card headers
      500: "#9e9e9e", // For inactive headers
    },
  },
  components: {
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundColor: "#f5f5f5", // Default card header background
          padding: "16px",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px 16px 16px 16px", // Increased top padding to 24px
          "&:last-child": {
            paddingBottom: "16px",
          },
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);
