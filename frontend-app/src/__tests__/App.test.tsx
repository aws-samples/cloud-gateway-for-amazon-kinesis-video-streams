import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock the withAuthenticator HOC
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: (Component: React.ComponentType) => {
    return (props: any) => <Component {...props} signOut={() => {}} user={{ 
      username: 'testuser',
      signInDetails: { loginId: 'test@example.com' }
    }} />;
  },
}));

// Mock Cloudscape components
vi.mock('@cloudscape-design/components', () => ({
  AppLayout: ({ children, navigation, content, ...props }: any) => (
    <div data-testid="app-layout" {...props}>
      <div data-testid="navigation">{navigation}</div>
      <div data-testid="content">{content}</div>
    </div>
  ),
  TopNavigation: ({ identity, utilities, ...props }: any) => (
    <div data-testid="top-navigation" {...props}>
      <div data-testid="identity">{identity?.title}</div>
      <div data-testid="utilities">
        {utilities?.map((util: any, index: number) => (
          <div key={index} data-testid={`utility-${index}`}>
            <button onClick={() => util.onItemClick?.({ detail: { id: 'signout' } })}>
              {util.text}
            </button>
          </div>
        ))}
      </div>
    </div>
  ),
  SideNavigation: ({ items, activeHref, onFollow, header, ...props }: any) => (
    <nav data-testid="side-navigation" {...props}>
      <div data-testid="nav-header">{header?.text}</div>
      {items?.map((item: any, index: number) => {
        if (item.type === 'divider') {
          return <hr key={index} data-testid={`divider-${index}`} />;
        }
        return (
          <a
            key={index}
            href={item.href}
            data-testid={`nav-item-${index}`}
            aria-current={activeHref === item.href ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              onFollow?.({ detail: { href: item.href } });
            }}
          >
            {item.text}
          </a>
        );
      })}
    </nav>
  ),
  ContentLayout: ({ children, header, ...props }: any) => (
    <div data-testid="content-layout" {...props}>
      <div data-testid="content-header">{header}</div>
      <div data-testid="content-body">{children}</div>
    </div>
  ),
  Header: ({ children, variant, description, ...props }: any) => (
    <div data-testid="header" data-variant={variant} {...props}>
      <h1>{children}</h1>
      {description && <p>{description}</p>}
    </div>
  ),
  Container: ({ children, ...props }: any) => (
    <div data-testid="container" {...props}>{children}</div>
  ),
  SpaceBetween: ({ children, size, ...props }: any) => (
    <div data-testid="space-between" data-size={size} {...props}>{children}</div>
  ),
  Box: ({ children, textAlign, color, fontSize, ...props }: any) => (
    <div data-testid="box" data-text-align={textAlign} data-color={color} data-font-size={fontSize} {...props}>
      {children}
    </div>
  ),
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

// Mock the component imports
vi.mock('../components', () => ({
  RTSPStreamTester: () => <div data-testid="rtsp-stream-tester">RTSP Stream Tester Component</div>,
  QuickStreamTester: () => <div data-testid="quick-stream-tester">Quick Stream Tester Component</div>,
  KinesisVideoStreamsIcon: () => <div data-testid="kinesis-icon">Kinesis Icon</div>
}));

vi.mock('../components/GStreamerPipelineGenerator', () => ({
  default: () => <div data-testid="gstreamer-pipeline-generator">GStreamer Pipeline Generator Component</div>
}));

vi.mock('../components/ErrorBoundary', () => ({
  default: ({ children }: any) => <div data-testid="error-boundary">{children}</div>
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location and history
const mockLocation = {
  hash: '',
  href: 'http://localhost:3000/',
};
const mockHistory = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
};
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});
Object.defineProperty(window, 'history', {
  value: mockHistory,
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('quick-tester');
    mockLocation.hash = '';
  });

  it('renders without crashing', () => {
    render(<App />);
    
    expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    expect(screen.getByTestId('top-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('side-navigation')).toBeInTheDocument();
  });

  it('displays the correct application title', () => {
    render(<App />);
    
    expect(screen.getByText('Kinesis Video Streams Gateway')).toBeInTheDocument();
  });

  it('displays user welcome message in content header', () => {
    render(<App />);
    
    expect(screen.getByText('Welcome back, test')).toBeInTheDocument();
  });

  it('displays user dropdown with sign out option', () => {
    render(<App />);
    
    const userButton = screen.getByText('test');
    expect(userButton).toBeInTheDocument();
    
    // Click to trigger sign out
    fireEvent.click(userButton);
    // Note: In a real test, you'd verify the signOut function was called
  });

  it('renders all navigation items', () => {
    render(<App />);
    
    expect(screen.getByText('📊 Stream Dashboard')).toBeInTheDocument();
    expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    expect(screen.getByText('🚀 Quick Stream Tester')).toBeInTheDocument();
    expect(screen.getByText('🔧 RTSP Stream Tester')).toBeInTheDocument();
    expect(screen.getByText('⚙️ GStreamer Pipeline Generator')).toBeInTheDocument();
  });

  it('shows Quick Stream Tester by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('quick-stream-tester')).toBeInTheDocument();
  });

  it('navigates to different tabs when clicked', async () => {
    render(<App />);
    
    // Initially shows Quick Stream Tester
    expect(screen.getByTestId('quick-stream-tester')).toBeInTheDocument();
    
    // Click RTSP Stream Tester
    const rtspLink = screen.getByText('🔧 RTSP Stream Tester');
    fireEvent.click(rtspLink);
    
    await waitFor(() => {
      expect(screen.getByTestId('rtsp-stream-tester')).toBeInTheDocument();
      expect(screen.queryByTestId('quick-stream-tester')).not.toBeInTheDocument();
    });
  });

  it('navigates to GStreamer Pipeline Generator', async () => {
    render(<App />);
    
    const pipelineLink = screen.getByText('⚙️ GStreamer Pipeline Generator');
    fireEvent.click(pipelineLink);
    
    await waitFor(() => {
      expect(screen.getByTestId('gstreamer-pipeline-generator')).toBeInTheDocument();
    });
  });

  it('shows coming soon message for dashboard', async () => {
    render(<App />);
    
    const dashboardLink = screen.getByText('📊 Stream Dashboard');
    fireEvent.click(dashboardLink);
    
    await waitFor(() => {
      expect(screen.getByText('🚧 Coming soon - Stream monitoring and management interface')).toBeInTheDocument();
    });
  });

  it('shows coming soon message for analytics', async () => {
    render(<App />);
    
    const analyticsLink = screen.getByText('📊 Analytics');
    fireEvent.click(analyticsLink);
    
    await waitFor(() => {
      expect(screen.getByText('🚧 Coming soon - Analytics and monitoring dashboard')).toBeInTheDocument();
    });
  });

  it('highlights the active navigation item', () => {
    render(<App />);
    
    // Find the active navigation item (should be quick-tester by default)
    const activeItem = screen.getByText('🚀 Quick Stream Tester').closest('a');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('updates URL when navigating', async () => {
    render(<App />);
    
    const dashboardLink = screen.getByText('📊 Stream Dashboard');
    fireEvent.click(dashboardLink);
    
    await waitFor(() => {
      expect(mockHistory.pushState).toHaveBeenCalledWith(null, '', '#dashboard');
    });
  });

  it('saves active tab to localStorage', async () => {
    render(<App />);
    
    const rtspLink = screen.getByText('🔧 RTSP Stream Tester');
    fireEvent.click(rtspLink);
    
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('activeTab', 'rtsp-tester');
    });
  });

  it('handles getUserDisplayName correctly', () => {
    const { rerender } = render(<App />);
    
    // Test with email loginId
    expect(screen.getByText('Welcome back, test')).toBeInTheDocument();
    
    // Test with different user props would require different mocking
    // This is a basic test of the current mock setup
  });

  it('renders error boundary', () => {
    render(<App />);
    
    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
  });
});
