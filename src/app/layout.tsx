import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import MuiThemeProviderWrapper from "@/context/MuiThemeProvider";
import ReduxProvider from "../store/ReduxProvider";
import QueryProvider from "@/context/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="">
        <ThemeProvider>
          <SidebarProvider>
            <MuiThemeProviderWrapper>
              <ReduxProvider>
                <QueryProvider>
                  {children}
                </QueryProvider>
              </ReduxProvider>
            </MuiThemeProviderWrapper>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
