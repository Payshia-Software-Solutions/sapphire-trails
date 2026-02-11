import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

export async function POST(request: Request) {
  const body = await request.json();

  try {
    // Step 1: Forward the data to the PHP backend to save it
    const phpResponse = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!phpResponse.ok) {
      const errorData = await phpResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to save booking to the database.');
    }
    
    const savedBooking = await phpResponse.json();

    // Step 2: If saving was successful, send emails using Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const { name, email, tour_date, guests, tour_package_id } = body;
    
    // In a real app, you would look up the tour name from the ID
    const tourName = `Tour Package ID: ${tour_package_id}`;

    // Email to Admin
    await transporter.sendMail({
      from: `"Booking System" <${process.env.MAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Booking Request from ${name}`,
      text: `A new booking request has been submitted.\n\nName: ${name}\nEmail: ${email}\nTour: ${tourName}\nDate: ${tour_date}\nGuests: ${guests}`,
      html: `<p>A new booking request has been submitted.</p>
             <h3>Details:</h3>
             <ul>
               <li><strong>Name:</strong> ${name}</li>
               <li><strong>Email:</strong> ${email}</li>
               <li><strong>Tour:</strong> ${tourName}</li>
               <li><strong>Date:</strong> ${tour_date}</li>
               <li><strong>Guests:</strong> ${guests}</li>
             </ul>
             <p>Please log in to the admin panel to accept or reject this booking.</p>`,
    });

    // Confirmation Email to User
    await transporter.sendMail({
      from: `Sapphire Trails <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Your Booking Request has been Received',
      text: `Hi ${name},\n\nThank you for your booking request for the ${tourName} on ${tour_date}. We have received it and will review it shortly. You will receive another email once your booking is confirmed.\n\nBest regards,\nThe Sapphire Trails Team`,
      html: `<p>Hi ${name},</p>
             <p>Thank you for your booking request for the <strong>${tourName}</strong> on <strong>${tour_date}</strong>. We have received it and will review it shortly. You will receive another email once your booking is confirmed.</p>
             <p>Best regards,<br>The Sapphire Trails Team</p>`,
    });

    // Return the response from the PHP backend to the frontend
    return NextResponse.json(savedBooking);

  } catch (error) {
    console.error('Email/Booking API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
