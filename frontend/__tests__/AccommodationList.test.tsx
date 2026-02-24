
import { render, screen, waitFor } from '@testing-library/react';
import AccommodationsPage from '../app/accommodations/page';
import '@testing-library/jest-dom';
import { AuthProvider } from '../context/AuthContext';
import * as accommodationApi from '../lib/api/accommodation';

describe('AccommodationList', () => {
  beforeEach(() => {
    jest.spyOn(accommodationApi, 'getActiveAccommodations').mockResolvedValue({
      success: true,
      message: 'ok',
      data: [
        {
          _id: '1',
          name: 'Eco Resort',
          address: 'Kathmandu',
          overview: 'A green stay',
          images: ['/images/main-section.png'],
          pricePerNight: 1000,
          location: { lat: 0, lng: 0 },
          amenities: [],
          ecoFriendlyHighlights: ['Solar'],
          rating: 4.5,
          totalReviews: 10,
          isActive: true,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders accommodations heading', async () => {
    render(
      <AuthProvider>
        <AccommodationsPage />
      </AuthProvider>
    );
    expect(await screen.findByRole('heading', { name: /find your perfect accommodations/i })).toBeInTheDocument();
  });

  it('shows at least one accommodation card', async () => {
    render(
      <AuthProvider>
        <AccommodationsPage />
      </AuthProvider>
    );
    // The card is a Link with heading, so use the accommodation name
    expect(await screen.findByText('Eco Resort')).toBeInTheDocument();
  });
});
