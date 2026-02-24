import { render, screen } from '@testing-library/react';
import HomePage from '../app/page';
import { AuthProvider } from '../context/AuthContext';

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /discover your nepal/i })).toBeInTheDocument();
  });

  it('shows for you section and loading', () => {
    render(
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    );
    expect(screen.getByRole('heading', { name: /for you/i })).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
