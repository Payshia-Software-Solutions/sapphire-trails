
export interface Booking {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  tourType: number;
  tourTitle?: string;
  adults: number;
  children: number;
  guests: number;
  date: string; // YYYY-MM-DD
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const mockBookings: Booking[] = [];
