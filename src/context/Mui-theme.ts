"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#721885",
      light: "#FFECEC",
    },
    secondary: {
      main: "#2FAB73",
    },
    background: {
      default: "#fff",
      paper: "#fff",
    },
    text: {
      primary: "#0B132A",
      secondary: "#4F5665",
    },
    grey: {
      100: "#EEEFF2",
      400: "#AFB5C0",
      500: "#DDDDDD",
    },
    error: {
      main: "#F53855",
    },
  },
  typography: {
    fontFamily: ["stc"].join(","),
    fontSize: 12,
  },
});

export default theme;
