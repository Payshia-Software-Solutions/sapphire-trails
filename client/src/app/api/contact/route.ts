import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message, tourInterest } = body;

    // Delegate saving and email delivery directly to the PHP Backend Mailer
    const phpResponse = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ 
        name, 
        email, 
        phone, 
        message, 
        subject: tourInterest || 'Website Inquiry',
        tour_interest: tourInterest 
      }),
    });

    if (!phpResponse.ok) {
      const errorData = await phpResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit contact message.');
    }
    
    const result = await phpResponse.json();
    return NextResponse.json({ message: 'Submission successful and emails dispatched.', data: result });

  } catch (error) {
    console.error('Contact API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
