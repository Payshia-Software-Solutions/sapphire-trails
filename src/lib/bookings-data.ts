export interface Booking {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  tourType: 'gem-explorer-day-tour' | 'sapphire-trails-deluxe' | string;
  guests: number;
  date: string; // YYYY-MM-DD
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const mockBookings: Booking[] = [];
