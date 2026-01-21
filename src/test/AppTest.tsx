import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

export default function AppTest() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <BrowserRouter>
              <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                  <h1 className="text-3xl font-bold text-primary">Lumora Test</h1>
                  <p className="text-muted-foreground">Testing basic app functionality</p>
                  <button
                    onClick={() => console.log('Test button clicked')}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Test Button
                  </button>
                </div>
              </div>
            </BrowserRouter>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}