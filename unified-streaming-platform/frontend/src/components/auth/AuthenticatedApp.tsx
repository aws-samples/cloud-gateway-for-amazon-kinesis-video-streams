/**
 * Authenticated App Wrapper
 * 
 * Handles authentication state and shows appropriate UI
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Box, Container } from '@cloudscape-design/components';
import AuthenticationFlow from './AuthenticationFlow';
import App from '../../App';

const AuthenticatedApp: React.FC = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <Container>
        <Box textAlign="center" padding="xxl">
          <Spinner size="large" />
          <Box variant="p" color="text-body-secondary" margin={{ top: 'm' }}>
            Loading...
          </Box>
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return <AuthenticationFlow />;
  }

  return <App />;
};

export default AuthenticatedApp;
