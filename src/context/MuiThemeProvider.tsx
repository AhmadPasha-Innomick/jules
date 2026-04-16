"use client";

import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ReactNode } from "react";
import theme from "./Mui-theme";

export default function MuiThemeProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
