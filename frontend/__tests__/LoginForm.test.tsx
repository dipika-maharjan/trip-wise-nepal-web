
import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../app/(auth)/login/page';
import { AuthProvider } from '../context/AuthContext';

describe('LoginForm', () => {
  it('renders login form', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    expect(await screen.findByLabelText('Email Address')).toBeInTheDocument();
    expect(await screen.findByLabelText('Password')).toBeInTheDocument();
  });

  it('shows error on empty submit', async () => {
    render(
      <AuthProvider>
        <Login />
      </AuthProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    // Match the actual error messages from your validation schema
    expect(await screen.findByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(await screen.findByText(/password must be at least 6 characters/i)).toBeInTheDocument();
  });
});
