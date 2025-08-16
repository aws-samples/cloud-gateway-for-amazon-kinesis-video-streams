import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

// Mock the withAuthenticator HOC
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: (Component: React.ComponentType) => {
    return (props: any) => <Component {...props} signOut={() => {}} user={{ username: 'testuser' }} />;
  },
  Button: ({ children, onClick, variation, ...props }: any) => (
    <button onClick={onClick} data-variation={variation} {...props}>{children}</button>
  ),
  Heading: ({ children, level, ...props }: any) => 
    React.createElement(`h${level}`, props, children),
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Flex: ({ children, ...props }: any) => <div data-testid="flex" {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
}));

// Mock the RTSPStreamTester component
vi.mock('../components', () => ({
  RTSPStreamTester: () => <div data-testid="rtsp-stream-tester">RTSP Stream Tester Component</div>
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    
    expect(screen.getByText('🎥 Kinesis Video Streams Gateway')).toBeInTheDocument();
  });

  it('displays user welcome message', () => {
    render(<App />);
    
    expect(screen.getByText('Welcome back, testuser')).toBeInTheDocument();
  });

  it('renders sign out button', () => {
    render(<App />);
    
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('renders tab navigation buttons', () => {
    render(<App />);
    
    expect(screen.getByRole('button', { name: /🔧 RTSP Stream Tester/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📊 Stream Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /⚙️ Pipeline Generator/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📈 Analytics/i })).toBeInTheDocument();
  });

  it('shows RTSP Stream Tester by default', () => {
    render(<App />);
    
    const rtspTester = screen.getByTestId('rtsp-stream-tester');
    expect(rtspTester).toBeInTheDocument();
  });

  it('switches tabs when clicked', () => {
    render(<App />);
    
    // Initially shows RTSP tester
    expect(screen.getByTestId('rtsp-stream-tester')).toBeInTheDocument();
    
    // Click dashboard tab
    const dashboardButton = screen.getByRole('button', { name: /📊 Stream Dashboard/i });
    fireEvent.click(dashboardButton);
    
    // Should show dashboard content
    expect(screen.getByText('Stream Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Monitor your active RTSP streams/i)).toBeInTheDocument();
    
    // RTSP tester should be hidden
    expect(screen.queryByTestId('rtsp-stream-tester')).not.toBeInTheDocument();
  });

  it('shows coming soon messages for placeholder tabs', () => {
    render(<App />);
    
    // Test dashboard tab
    const dashboardButton = screen.getByRole('button', { name: /📊 Stream Dashboard/i });
    fireEvent.click(dashboardButton);
    expect(screen.getByText(/🚧 Coming soon - Stream monitoring/i)).toBeInTheDocument();
    
    // Test pipeline tab
    const pipelineButton = screen.getByRole('button', { name: /⚙️ Pipeline Generator/i });
    fireEvent.click(pipelineButton);
    expect(screen.getByText(/🚧 Coming soon - AI-powered pipeline/i)).toBeInTheDocument();
    
    // Test analytics tab
    const analyticsButton = screen.getByRole('button', { name: /📈 Analytics/i });
    fireEvent.click(analyticsButton);
    expect(screen.getByText(/🚧 Coming soon - Analytics and monitoring/i)).toBeInTheDocument();
  });

  it('highlights active tab button', () => {
    render(<App />);
    
    // Initially RTSP tester should be active (primary variation)
    const rtspButton = screen.getByRole('button', { name: /🔧 RTSP Stream Tester/i });
    expect(rtspButton).toHaveAttribute('data-variation', 'primary');
    
    // Other buttons should be link variation
    const dashboardButton = screen.getByRole('button', { name: /📊 Stream Dashboard/i });
    expect(dashboardButton).toHaveAttribute('data-variation', 'link');
    
    // Click dashboard button
    fireEvent.click(dashboardButton);
    
    // Now dashboard should be active
    expect(dashboardButton).toHaveAttribute('data-variation', 'primary');
    expect(rtspButton).toHaveAttribute('data-variation', 'link');
  });
});
