import { CreateBookingRequest, MarketplaceVendor } from '@shared/types';

const API_BASE_URL = 'http://192.168.0.120:3000/api'; // Replace with your IP

export const ApiClient = {
  // Fetch vendors based on search criteria
  getMarketplace: async (category: string, date: string, qty: number): Promise<MarketplaceVendor[]> => {
    const params = new URLSearchParams({ category, date, qty: qty.toString() });
    const response = await fetch(`${API_BASE_URL}/marketplace/search?${params}`);
    
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },

  // Submit a booking request from the planner to a vendor
  createBooking: async (data: CreateBookingRequest) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Booking failed');
    return response.json();
  }
};