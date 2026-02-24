
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../app/(auth)/register/page';
import { AuthProvider } from '../context/AuthContext';

describe('RegisterForm', () => {
  it('renders register form', async () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    expect(await screen.findByLabelText('Email Address')).toBeInTheDocument();
    expect(await screen.findByLabelText('Password')).toBeInTheDocument();
    expect(await screen.findByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('shows error on mismatched passwords', async () => {
    render(
      <AuthProvider>
        <Register />
      </AuthProvider>
    );
    fireEvent.change(await screen.findByLabelText('Password'), { target: { value: 'abc12345' } });
    fireEvent.change(await screen.findByLabelText('Confirm Password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });
});
