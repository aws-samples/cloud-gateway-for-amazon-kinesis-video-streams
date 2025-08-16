import { useState } from 'react'
import { type AuthUser } from "aws-amplify/auth";
import { type UseAuthenticator } from "@aws-amplify/ui-react-core";
import { 
  withAuthenticator, 
  Button, 
  Heading, 
  View, 
  Flex,
  Text,
  Card
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css'
import { RTSPStreamTester } from './components';

type AppProps = {
  signOut?: UseAuthenticator["signOut"];
  user?: AuthUser;
};

const App: React.FC<AppProps> = ({ signOut, user }) => {
  const [activeTab, setActiveTab] = useState('rtsp-tester');

  return (
    <View>
      {/* Header */}
      <View 
        style={{
          backgroundColor: 'var(--amplify-colors-background-secondary)',
          padding: 'var(--amplify-space-medium)',
          borderBottom: '1px solid var(--amplify-colors-border-primary)'
        }}
      >
        <Flex 
          style={{
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <View>
            <Heading level={1} style={{ margin: 0 }}>
              🎥 Kinesis Video Streams Gateway
            </Heading>
            <Text style={{ color: 'var(--amplify-colors-font-secondary)' }}>
              Welcome back, {user?.username}
            </Text>
          </View>
          <Button onClick={signOut} variation="link">
            Sign out
          </Button>
        </Flex>
      </View>

      {/* Main Content */}
      <View style={{ padding: 'var(--amplify-space-medium)' }}>
        {/* Simple Tab Navigation */}
        <Flex 
          style={{ 
            gap: 'var(--amplify-space-medium)', 
            marginBottom: 'var(--amplify-space-large)' 
          }}
        >
          <Button 
            variation={activeTab === 'rtsp-tester' ? 'primary' : 'outlined'}
            onClick={() => setActiveTab('rtsp-tester')}
          >
            🔧 RTSP Stream Tester
          </Button>
          <Button 
            variation={activeTab === 'dashboard' ? 'primary' : 'outlined'}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Stream Dashboard
          </Button>
          <Button 
            variation={activeTab === 'pipeline' ? 'primary' : 'outlined'}
            onClick={() => setActiveTab('pipeline')}
          >
            ⚙️ Pipeline Generator
          </Button>
          <Button 
            variation={activeTab === 'analytics' ? 'primary' : 'outlined'}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </Button>
        </Flex>

        {/* Tab Content */}
        {activeTab === 'rtsp-tester' && <RTSPStreamTester />}
        
        {activeTab === 'dashboard' && (
          <Card style={{ padding: 'var(--amplify-space-large)', textAlign: 'center' }}>
            <Heading level={3}>Stream Dashboard</Heading>
            <Text style={{ color: 'gray', marginTop: 'var(--amplify-space-medium)' }}>
              Monitor your active RTSP streams and Kinesis Video Streams
            </Text>
            <Text style={{ fontSize: 'small', marginTop: 'var(--amplify-space-medium)' }}>
              🚧 Coming soon - Stream monitoring and management interface
            </Text>
          </Card>
        )}
        
        {activeTab === 'pipeline' && (
          <Card style={{ padding: 'var(--amplify-space-large)', textAlign: 'center' }}>
            <Heading level={3}>GStreamer Pipeline Generator</Heading>
            <Text style={{ color: 'gray', marginTop: 'var(--amplify-space-medium)' }}>
              Generate optimized GStreamer pipelines for your cameras
            </Text>
            <Text style={{ fontSize: 'small', marginTop: 'var(--amplify-space-medium)' }}>
              🚧 Coming soon - AI-powered pipeline generation interface
            </Text>
          </Card>
        )}
        
        {activeTab === 'analytics' && (
          <Card style={{ padding: 'var(--amplify-space-large)', textAlign: 'center' }}>
            <Heading level={3}>Stream Analytics</Heading>
            <Text style={{ color: 'gray', marginTop: 'var(--amplify-space-medium)' }}>
              View performance metrics and stream health
            </Text>
            <Text style={{ fontSize: 'small', marginTop: 'var(--amplify-space-medium)' }}>
              🚧 Coming soon - Analytics and monitoring dashboard
            </Text>
          </Card>
        )}
      </View>
    </View>
  )
};

export default withAuthenticator(App);
