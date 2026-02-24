
import { render, screen } from '@testing-library/react';
import DashboardPage from '../app/user/dashboard/page';
import { AuthProvider } from '../context/AuthContext';


describe('DashboardPage', () => {
  it('renders dashboard heading', async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    );
    // Heading is 'Welcome, Traveler!'
    expect(await screen.findByRole('heading', { name: /welcome, traveler/i })).toBeInTheDocument();
  });

  it('shows user bookings section', async () => {
    render(
      <AuthProvider>
        <DashboardPage />
      </AuthProvider>
    );
    expect(await screen.findByText(/my bookings/i)).toBeInTheDocument();
  });
});
