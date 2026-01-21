import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// ... other imports

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title: string;
  onNavItemClick?: (itemId: string) => void;
}

export function DashboardLayout({ children, sidebar, title, onNavItemClick }: DashboardLayoutProps) {
  // ... existing code with proper error handling

  return (
    <div className="min-h-screen bg-background">
      {/* Add error boundary */}
      <ErrorBoundary>
        {/* Top navigation */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-50">
          {/* ... existing header code */}
        </header>

        {/* Main content area */}
        <div className="pt-16 flex min-h-screen">
          {/* ... existing content code */}
        </div>
      </ErrorBoundary>
    </div>
  );
}

// Add ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("DashboardLayout Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Something went wrong</h2>
            <p className="text-muted-foreground">Please refresh the page or try again later</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}