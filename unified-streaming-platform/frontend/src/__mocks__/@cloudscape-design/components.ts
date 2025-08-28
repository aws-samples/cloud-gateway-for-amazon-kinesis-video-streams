import { vi } from 'vitest';

// Mock all Cloudscape Design components used in the application
export const Box = vi.fn(({ children, ...props }) => (
  <div data-testid="box" {...props}>{children}</div>
));

export const Button = vi.fn(({ children, onClick, disabled, loading, ...props }) => (
  <button onClick={onClick} disabled={disabled || loading} {...props}>
    {loading ? 'Loading...' : children}
  </button>
));

export const Container = vi.fn(({ children, ...props }) => (
  <div data-testid="container" {...props}>{children}</div>
));

export const Header = vi.fn(({ children, ...props }) => (
  <div data-testid="header" {...props}>{children}</div>
));

export const SpaceBetween = vi.fn(({ children, direction = 'vertical', size = 'm', ...props }) => (
  <div data-testid="space-between" data-direction={direction} data-size={size} {...props}>
    {children}
  </div>
));

export const Alert = vi.fn(({ children, type = 'info', ...props }) => (
  <div data-testid="alert" data-type={type} {...props}>{children}</div>
));

export const Table = vi.fn(({ 
  items = [], 
  columnDefinitions = [], 
  loading = false, 
  empty,
  ...props 
}) => (
  <div data-testid="table" data-loading={loading.toString()} {...props}>
    {loading ? (
      <div>Loading...</div>
    ) : items.length === 0 ? (
      empty || <div>No items</div>
    ) : (
      <div>
        {items.map((item, index) => (
          <div key={index} data-testid={`table-row-${index}`}>
            {columnDefinitions.map((col, colIndex) => (
              <span key={colIndex} data-testid={`table-cell-${index}-${colIndex}`}>
                {typeof col.cell === 'function' ? col.cell(item) : item[col.id]}
              </span>
            ))}
          </div>
        ))}
      </div>
    )}
  </div>
));

export const FormField = vi.fn(({ children, label, errorText, ...props }) => (
  <div data-testid="form-field" {...props}>
    {label && <label>{label}</label>}
    {children}
    {errorText && <div data-testid="error-text">{errorText}</div>}
  </div>
));

export const Input = vi.fn(({ value, onChange, placeholder, type = 'text', ...props }) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange && onChange({ detail: { value: e.target.value } })}
    placeholder={placeholder}
    data-testid="input"
    {...props}
  />
));

export const Select = vi.fn(({ 
  selectedOption, 
  onChange, 
  options = [], 
  placeholder,
  ...props 
}) => (
  <select
    value={selectedOption?.value || ''}
    onChange={(e) => {
      const option = options.find(opt => opt.value === e.target.value);
      onChange && onChange({ detail: { selectedOption: option } });
    }}
    data-testid="select"
    {...props}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((option, index) => (
      <option key={index} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
));

export const Tabs = vi.fn(({ 
  tabs = [], 
  activeTabId, 
  onChange,
  ...props 
}) => (
  <div data-testid="tabs" {...props}>
    <div data-testid="tab-headers">
      {tabs.map((tab, index) => (
        <button
          key={index}
          data-testid={`tab-${tab.id}`}
          data-active={activeTabId === tab.id}
          onClick={() => onChange && onChange({ detail: { activeTabId: tab.id } })}
        >
          {tab.label}
        </button>
      ))}
    </div>
    <div data-testid="tab-content">
      {tabs.find(tab => tab.id === activeTabId)?.content}
    </div>
  </div>
));

export const Link = vi.fn(({ children, onFollow, ...props }) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onFollow && onFollow();
    }}
    data-testid="link"
    {...props}
  >
    {children}
  </a>
));

export const TopNavigation = vi.fn(({ 
  identity, 
  utilities = [],
  ...props 
}) => (
  <nav data-testid="top-navigation" {...props}>
    {identity && <div data-testid="nav-identity">{identity.title}</div>}
    <div data-testid="nav-utilities">
      {utilities.map((utility, index) => (
        <div key={index} data-testid={`nav-utility-${index}`}>
          {utility.text}
        </div>
      ))}
    </div>
  </nav>
));

export const SideNavigation = vi.fn(({ 
  items = [], 
  activeHref,
  onFollow,
  ...props 
}) => (
  <nav data-testid="side-navigation" {...props}>
    {items.map((item, index) => (
      <div key={index} data-testid={`nav-item-${index}`}>
        <a
          href={item.href}
          data-active={activeHref === item.href}
          onClick={(e) => {
            e.preventDefault();
            onFollow && onFollow({ detail: item });
          }}
        >
          {item.text}
        </a>
      </div>
    ))}
  </nav>
));

export const AppLayout = vi.fn(({ 
  navigation, 
  content, 
  navigationOpen = true,
  onNavigationChange,
  ...props 
}) => (
  <div data-testid="app-layout" data-navigation-open={navigationOpen} {...props}>
    {navigation && (
      <div data-testid="app-layout-navigation">
        {navigation}
      </div>
    )}
    <div data-testid="app-layout-content">
      {content}
    </div>
  </div>
));

export const ContentLayout = vi.fn(({ children, header, ...props }) => (
  <div data-testid="content-layout" {...props}>
    {header && <div data-testid="content-header">{header}</div>}
    <div data-testid="content-body">{children}</div>
  </div>
));

export const Spinner = vi.fn(({ size = 'normal', ...props }) => (
  <div data-testid="spinner" data-size={size} {...props}>
    Loading...
  </div>
));

export const StatusIndicator = vi.fn(({ type = 'success', children, ...props }) => (
  <div data-testid="status-indicator" data-type={type} {...props}>
    {children}
  </div>
));

// Export default mock object
export default {
  Box,
  Button,
  Container,
  Header,
  SpaceBetween,
  Alert,
  Table,
  FormField,
  Input,
  Select,
  Tabs,
  Link,
  TopNavigation,
  SideNavigation,
  AppLayout,
  ContentLayout,
  Spinner,
  StatusIndicator,
};
