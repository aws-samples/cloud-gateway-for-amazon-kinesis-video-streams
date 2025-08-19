import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { TopNavigation } from '@cloudscape-design/components';
import { useAuthenticator } from '@aws-amplify/ui-react';

// Mock the useAuthenticator hook
vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: vi.fn(),
}));

describe('Debug TopNavigation', () => {
  it('should render user dropdown when utilities are provided', () => {
    const mockUser = {
      username: 'testuser',
      attributes: {
        email: 'test@example.com',
        given_name: 'John',
        family_name: 'Doe',
        name: 'John Doe'
      }
    };

    // Helper function to get user display name
    const getUserDisplayName = (user?: any): string => {
      if (!user) return "User";
      
      console.log('User object:', user);
      console.log('User attributes:', user.attributes);
      
      if (user.attributes) {
        const givenName = user.attributes.given_name || user.attributes['custom:given_name'];
        const familyName = user.attributes.family_name || user.attributes['custom:family_name'];
        const name = user.attributes.name;
        const email = user.attributes.email;
        
        if (givenName && familyName) {
          return `${givenName} ${familyName}`;
        }
        
        if (name) {
          return name;
        }
        
        if (givenName) {
          return givenName;
        }
        
        if (email) {
          return email.split('@')[0];
        }
      }
      
      const fallbackName = user.username || user.signInDetails?.loginId || "User";
      if (fallbackName.includes('@')) {
        return fallbackName.split('@')[0];
      }
      
      return fallbackName;
    };

    const utilities = [
      {
        type: "button-dropdown" as const,
        text: getUserDisplayName(mockUser),
        description: mockUser?.attributes?.email || mockUser?.username || "User",
        iconName: "user-profile" as const,
        items: [
          {
            id: "signout",
            text: "Sign out"
          }
        ],
        onItemClick: ({ detail }: any) => {
          console.log('Sign out clicked');
        }
      }
    ];

    console.log('Utilities array:', utilities);

    render(
      <TopNavigation
        identity={{
          href: "#",
          title: "Test App"
        }}
        utilities={utilities}
      />
    );

    // Debug: log the entire DOM
    screen.debug();

    // Try to find the user button
    const userButton = screen.queryByRole('button', { name: /john doe/i });
    console.log('User button found:', userButton);
    
    expect(userButton).toBeInTheDocument();
  });
});
