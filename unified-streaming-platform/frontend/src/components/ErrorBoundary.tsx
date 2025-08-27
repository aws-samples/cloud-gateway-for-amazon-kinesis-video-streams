import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Container, Header } from '@cloudscape-design/components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Container>
          <Header variant="h1">Something went wrong</Header>
          <Alert type="error" header="Application Error">
            An unexpected error occurred. Please refresh the page to try again.
            {this.state.error && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                Error: {this.state.error.message}
              </div>
            )}
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
