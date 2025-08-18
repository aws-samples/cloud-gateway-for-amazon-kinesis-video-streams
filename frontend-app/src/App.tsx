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
import { RTSPStreamTester, QuickStreamTester } from './components';

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
            variation={activeTab === 'rtsp-tester' ? 'primary' : 'link'}
            onClick={() => setActiveTab('rtsp-tester')}
            style={activeTab === 'rtsp-tester' ? {
              backgroundColor: '#0073bb',
              color: 'white',
              border: '2px solid #0073bb'
            } : {
              backgroundColor: 'white',
              color: '#0073bb',
              border: '2px solid #0073bb'
            }}
          >
            🔧 RTSP Stream Tester
          </Button>
          <Button 
            variation={activeTab === 'quick-tester' ? 'primary' : 'link'}
            onClick={() => setActiveTab('quick-tester')}
            style={activeTab === 'quick-tester' ? {
              backgroundColor: '#0073bb',
              color: 'white',
              border: '2px solid #0073bb'
            } : {
              backgroundColor: 'white',
              color: '#0073bb',
              border: '2px solid #0073bb'
            }}
          >
            🚀 Quick Tester
          </Button>
          <Button 
            variation={activeTab === 'dashboard' ? 'primary' : 'link'}
            onClick={() => setActiveTab('dashboard')}
            style={activeTab === 'dashboard' ? {
              backgroundColor: '#0073bb',
              color: 'white',
              border: '2px solid #0073bb'
            } : {
              backgroundColor: 'white',
              color: '#0073bb',
              border: '2px solid #0073bb'
            }}
          >
            📊 Stream Dashboard
          </Button>
          <Button 
            variation={activeTab === 'pipeline' ? 'primary' : 'link'}
            onClick={() => setActiveTab('pipeline')}
            style={activeTab === 'pipeline' ? {
              backgroundColor: '#0073bb',
              color: 'white',
              border: '2px solid #0073bb'
            } : {
              backgroundColor: 'white',
              color: '#0073bb',
              border: '2px solid #0073bb'
            }}
          >
            ⚙️ Pipeline Generator
          </Button>
          <Button 
            variation={activeTab === 'analytics' ? 'primary' : 'link'}
            onClick={() => setActiveTab('analytics')}
            style={activeTab === 'analytics' ? {
              backgroundColor: '#0073bb',
              color: 'white',
              border: '2px solid #0073bb'
            } : {
              backgroundColor: 'white',
              color: '#0073bb',
              border: '2px solid #0073bb'
            }}
          >
            📈 Analytics
          </Button>
        </Flex>

        {/* Tab Content */}
        {activeTab === 'rtsp-tester' && <RTSPStreamTester />}
        
        {activeTab === 'quick-tester' && <QuickStreamTester />}
        
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
