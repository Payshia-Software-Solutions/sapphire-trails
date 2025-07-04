
export interface Booking {
  id: number;
  user_id?: number;
  name: string;
  email: string;
  phone?: string;
  tourType: number;
  tourTitle?: string;
  guests: number;
  date: string; // YYYY-MM-DD
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const mockBookings: Booking[] = [];
