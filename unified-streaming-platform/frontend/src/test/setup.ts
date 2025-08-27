import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    hash: '',
    href: 'http://localhost:3000/',
    pathname: '/',
    search: '',
    assign: vi.fn(),
    reload: vi.fn(),
    replace: vi.fn(),
  },
  writable: true,
});

// Mock window.history
Object.defineProperty(window, 'history', {
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
  },
  writable: true,
});

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
});

// Mock AWS Cognito client
vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityProviderClient: vi.fn().mockImplementation(() => ({
    send: vi.fn().mockResolvedValue({
      AuthenticationResult: {
        AccessToken: 'mock-access-token',
        IdToken: 'mock-id-token',
        RefreshToken: 'mock-refresh-token'
      }
    })
  })),
  InitiateAuthCommand: vi.fn(),
  SignUpCommand: vi.fn(),
  ConfirmSignUpCommand: vi.fn(),
  ResendConfirmationCodeCommand: vi.fn(),
  ForgotPasswordCommand: vi.fn(),
  ConfirmForgotPasswordCommand: vi.fn(),
  GetUserCommand: vi.fn(),
  GlobalSignOutCommand: vi.fn(),
  AuthFlowType: {
    USER_PASSWORD_AUTH: 'USER_PASSWORD_AUTH'
  }
}));
