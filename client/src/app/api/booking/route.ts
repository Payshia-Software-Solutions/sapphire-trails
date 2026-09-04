import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Delegate creation & email dispatch directly to PHP backend
    const phpResponse = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(body),
    });

    if (!phpResponse.ok) {
      const errorData = await phpResponse.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || 'Failed to save booking to the database.');
    }
    
    const savedBooking = await phpResponse.json();
    return NextResponse.json(savedBooking);

  } catch (error) {
    console.error('Error handling booking request:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
