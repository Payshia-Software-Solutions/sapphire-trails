export interface Booking {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tourType: 'gem-explorer-day-tour' | 'sapphire-trails-deluxe';
  guests: number;
  date: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export const mockBookings: Booking[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    tourType: 'sapphire-trails-deluxe',
    guests: 2,
    date: '2024-08-15',
    message: 'We are celebrating our anniversary and would like a special arrangement if possible.',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    tourType: 'gem-explorer-day-tour',
    guests: 4,
    date: '2024-08-20',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    phone: '987-654-3210',
    tourType: 'sapphire-trails-deluxe',
    guests: 1,
    date: '2024-09-01',
    message: 'Looking forward to the tour!',
    status: 'accepted',
  },
   {
    id: '4',
    name: 'Emily White',
    email: 'emily.white@example.com',
    tourType: 'gem-explorer-day-tour',
    guests: 3,
    date: '2024-08-18',
    message: 'Unfortunately, we need to cancel this booking.',
    status: 'rejected',
  },
];
