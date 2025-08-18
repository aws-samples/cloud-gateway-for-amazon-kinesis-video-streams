import { useState } from 'react'
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {
  AppLayout,
  TopNavigation,
  SideNavigation,
  ContentLayout,
  Header,
  SpaceBetween,
  Button,
  Box,
  Container
} from '@cloudscape-design/components';
import './App.css'
import { RTSPStreamTester, QuickStreamTester, KinesisVideoStreamsIcon } from './components';

type AppProps = {
  signOut?: UseAuthenticator["signOut"];
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState('quick-tester');
  const [navigationOpen, setNavigationOpen] = useState(false);

  const navigationItems = [
    {
      type: "link" as const,
      text: "🚀 Quick Tester",
      href: "#quick-tester",
      info: "Test demo streams"
    },
    {
      type: "link" as const,
      text: "🔧 RTSP Stream Tester", 
      href: "#rtsp-tester",
      info: "Full stream testing"
    },
    {
      type: "divider" as const
    },
    {
      type: "link" as const,
      text: "📊 Stream Dashboard",
      href: "#dashboard",
      info: "Monitor streams"
    },
    {
      type: "link" as const,
      text: "⚙️ Pipeline Generator",
      href: "#pipeline",
      info: "Generate pipelines"
    },
    {
      type: "link" as const,
      text: "📈 Analytics",
      href: "#analytics",
      info: "View metrics"
    }
  ];

  const handleNavigationChange = (event: any) => {
    event.preventDefault();
    if (event.detail.href) {
      const tabName = event.detail.href.replace('#', '');
      setActiveTab(tabName);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'quick-tester':
        return <QuickStreamTester />;
      case 'rtsp-tester':
        return <RTSPStreamTester />;
      case 'dashboard':
        return (
          <Container>
            <SpaceBetween size="l">
              <Header variant="h1">Stream Dashboard</Header>
              <Box textAlign="center" color="text-body-secondary">
                <SpaceBetween size="m">
                  <Box fontSize="body-m">
                    Monitor your active RTSP streams and Kinesis Video Streams
                  </Box>
                  <Box fontSize="body-s">
                    🚧 Coming soon - Stream monitoring and management interface
                  </Box>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>
        );
      case 'pipeline':
        return (
          <Container>
            <SpaceBetween size="l">
              <Header variant="h1">GStreamer Pipeline Generator</Header>
              <Box textAlign="center" color="text-body-secondary">
                <SpaceBetween size="m">
                  <Box fontSize="body-m">
                    Generate optimized GStreamer pipelines for your cameras
                  </Box>
                  <Box fontSize="body-s">
                    🚧 Coming soon - AI-powered pipeline generation interface
                  </Box>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>
        );
      case 'analytics':
        return (
          <Container>
            <SpaceBetween size="l">
              <Header variant="h1">Stream Analytics</Header>
              <Box textAlign="center" color="text-body-secondary">
                <SpaceBetween size="m">
                  <Box fontSize="body-m">
                    View performance metrics and stream health
                  </Box>
                  <Box fontSize="body-s">
                    🚧 Coming soon - Analytics and monitoring dashboard
                  </Box>
                </SpaceBetween>
              </Box>
            </SpaceBetween>
          </Container>
        );
      default:
        return <QuickStreamTester />;
    }
  };

  return (
    <div style={{ width: '95%', margin: '0 auto', minHeight: '100vh' }}>
      <TopNavigation
        identity={{
          href: "#",
          title: "Kinesis Video Streams Gateway",
          logo: {
            src: "data:image/svg+xml;base64," + btoa(`
              <svg width="80" height="80" viewBox="0 0 80 80" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1">
                    <stop stop-color="#4D27A8" offset="0%"></stop>
                    <stop stop-color="#A166FF" offset="100%"></stop>
                  </linearGradient>
                </defs>
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g fill="url(#linearGradient-1)">
                    <rect x="0" y="0" width="80" height="80"></rect>
                  </g>
                  <g transform="translate(8.000000, 8.000000)" fill="#FFFFFF">
                    <path d="M29,37.553 L29,39.602 C14.938,42.908 13,48.719 13,54 L11,54 C11,48.23 13.077,41.18 29,37.553 L29,37.553 Z M29,42.76 L29,44.898 C19.007,48.854 19,55.011 19,60 L17,60 C17,54.879 17.009,47.191 29,42.76 L29,42.76 Z M57,53.575 C57,54.361 56.361,55 55.575,55 L34.425,55 C33.639,55 33,54.361 33,53.575 L33,40.424 C33,39.639 33.639,39 34.425,39 L55.575,39 C56.361,39 57,39.639 57,40.424 L57,53.575 Z M55.575,37 L34.425,37 C32.536,37 31,38.536 31,40.424 L31,53.575 C31,55.464 32.536,57 34.425,57 L55.575,57 C57.464,57 59,55.464 59,53.575 L59,40.424 C59,38.536 57.464,37 55.575,37 L55.575,37 Z M59,31 L59,33 C13.756,33 7,41.145 7,46 L5,46 C5,38.604 15.039,33.92 34.893,32 C15.039,30.079 5,25.395 5,18 L7,18 C7,22.855 13.756,31 59,31 L59,31 Z M59,27 L59,29 C16.703,29 11,19.395 11,10 L13,10 C13,18.406 18.465,27 59,27 L59,27 Z M59,23 L59,25 C40.663,25 28.728,22.641 22.51,17.788 C17,13.488 17,8.004 17,4 L19,4 C19,11.566 19,23 59,23 L59,23 Z M43,49.277 L43,44.723 L46.984,47 L43,49.277 Z M49.496,46.132 L42.496,42.132 C42.187,41.954 41.806,41.956 41.498,42.135 C41.189,42.314 41,42.643 41,43 L41,51 C41,51.356 41.189,51.686 41.498,51.865 C41.653,51.955 41.826,52 42,52 C42.171,52 42.343,51.956 42.496,51.868 L49.496,47.868 C49.808,47.69 50,47.359 50,47 C50,46.641 49.808,46.309 49.496,46.132 L49.496,46.132 Z"></path>
                  </g>
                </g>
              </svg>
            `),
            alt: "Amazon Kinesis Video Streams"
          }
        }}
        utilities={[
          {
            type: "menu-dropdown",
            text: user?.username || "User",
            description: user?.username || "User",
            iconName: "user-profile",
            items: [
              {
                id: "signout",
                text: "Sign out"
              }
            ],
            onItemClick: ({ detail }) => {
              if (detail.id === "signout" && signOut) {
                signOut();
              }
            }
          }
        ]}
      />
      
      <AppLayout
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        navigation={
          <SideNavigation
            activeHref={`#${activeTab}`}
            header={{ text: "Navigation", href: "#" }}
            items={navigationItems}
            onFollow={handleNavigationChange}
          />
        }
        content={
          <ContentLayout
            header={
              <SpaceBetween size="m">
                <Header
                  variant="h1"
                  info={
                    <Box display="inline" color="text-body-secondary">
                      Welcome back, {user?.username}
                    </Box>
                  }
                >
                  {activeTab === 'quick-tester' && '🚀 Quick Stream Tester'}
                  {activeTab === 'rtsp-tester' && '🔧 RTSP Stream Tester'}
                  {activeTab === 'dashboard' && '📊 Stream Dashboard'}
                  {activeTab === 'pipeline' && '⚙️ Pipeline Generator'}
                  {activeTab === 'analytics' && '📈 Analytics'}
                </Header>
              </SpaceBetween>
            }
          >
            {renderContent()}
          </ContentLayout>
        }
        toolsHide
      />
    </div>
  )
};

export default withAuthenticator(App);
