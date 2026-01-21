import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import MinimalTest from "./test/MinimalTest";
import { futureConfig } from "./routerConfig";
import { initializeLocalStorage } from "./lib/initializeLocalStorage";
import { useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => {
  // Initialize local storage when app loads
  useEffect(() => {
    try {
      initializeLocalStorage();
    } catch (error) {
      console.error('Error initializing local storage:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={futureConfig}>
                <Routes>
                  <Route path="*" element={<MinimalTest />} />
                </Routes>
              </BrowserRouter>
              <ThemeToggle />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;