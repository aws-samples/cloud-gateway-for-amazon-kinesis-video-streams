import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { TopNavigation } from '@cloudscape-design/components';

describe('Simple TopNavigation Debug', () => {
  it('should render basic button utility', () => {
    const utilities = [
      {
        type: "button" as const,
        text: "John Doe",
        iconName: "user-profile" as const,
        onClick: () => console.log('clicked')
      }
    ];

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

  it('should render button-dropdown utility', () => {
    const utilities = [
      {
        type: "button-dropdown" as const,
        text: "John Doe",
        description: "test@example.com",
        iconName: "user-profile" as const,
        items: [
          {
            id: "signout",
            text: "Sign out"
          }
        ],
        onItemClick: ({ detail }: any) => {
          console.log('Item clicked:', detail.id);
        }
      }
    ];

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

    // Try to find the user button by text content
    const userButton = screen.queryByText(/john doe/i);
    console.log('User button found by text:', userButton);
    
    // Try to find by role
    const dropdownButton = screen.queryByRole('button', { expanded: false });
    console.log('Dropdown button found:', dropdownButton);
    
    expect(userButton || dropdownButton).toBeInTheDocument();
  });
});
