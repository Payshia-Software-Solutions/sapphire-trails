import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, source } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim();
    const cleanSource = source?.trim() || '2026 Gem Buyer Guide Download';

    // 1. Post to dedicated subscribers endpoint in PHP backend
    const subResponse = await fetch(`${API_BASE_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: cleanEmail,
        source: cleanSource,
      }),
    });

    if (!subResponse.ok) {
      const errorData = await subResponse.json().catch(() => ({}));
      // If endpoint not reached or errors, fallback to contacts endpoint
      const fallbackResponse = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: 'Guide Subscriber',
          email: cleanEmail,
          phone: '',
          tour_interest: 'Guide Download (Lead Magnet)',
          subject: 'Guide Download: ' + cleanSource,
          message: `Subscriber requested ${cleanSource} from Sapphire Trails website.`,
        }),
      });

      if (!fallbackResponse.ok) {
        throw new Error(errorData.error || 'Failed to register subscription.');
      }
    }

    const result = await subResponse.json().catch(() => ({ message: 'Subscription queued.' }));
    return NextResponse.json({
      message: 'Subscription successful and guide queued for delivery.',
      data: result,
    });
  } catch (error) {
    console.error('Subscribe API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
