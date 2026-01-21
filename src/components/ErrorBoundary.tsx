import React from 'react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-destructive">Oops! Something went wrong</h2>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <p className="text-sm font-medium mb-2">Error Details:</p>
              <p className="text-sm text-muted-foreground mb-1">
                <strong>Message:</strong> {this.state.error?.message || 'Unknown error'}
              </p>
              {this.state.errorInfo && (
                <p className="text-sm text-muted-foreground">
                  <strong>Component:</strong> {this.state.errorInfo.componentStack.split('\n')[0]}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={this.handleReload}
                className="w-full gradient-hero"
                size="lg"
              >
                Refresh Application
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Return to Home
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;