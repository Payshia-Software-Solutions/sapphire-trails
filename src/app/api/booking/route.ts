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

    const { 
      name, 
      email, 
      phone,
      address,
      tour_date, 
      guests, 
      adults,
      children,
      tour_name,
      message,
    } = body;
    

    // Email to Admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="color: #395241; font-size: 24px;">New Booking Request</h1>
          </div>
          <p>A new booking request has been submitted. Please review the details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tour Package</td><td style="padding: 10px; border: 1px solid #ddd;">${tour_name}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name</td><td style="padding: 10px; border: 1px solid #ddd;">${name}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 10px; border: 1px solid #ddd;">${email}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Phone</td><td style="padding: 10px; border: 1px solid #ddd;">${phone || 'N/A'}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Address</td><td style="padding: 10px; border: 1px solid #ddd;">${address || 'N/A'}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tour Date</td><td style="padding: 10px; border: 1px solid #ddd;">${tour_date}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Guests</td><td style="padding: 10px; border: 1px solid #ddd;">${guests} (${adults} Adults, ${children} Children)</td></tr>
            ${message ? `<tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; vertical-align: top;">Message</td><td style="padding: 10px; border: 1px solid #ddd;">${message}</td></tr>` : ''}
          </table>
          <p style="text-align: center;">Please log in to the admin panel to accept or reject this booking.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Booking System" <${process.env.MAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Booking Request from ${name} for ${tour_name}`,
      html: adminHtml,
    });

    // Confirmation Email to User
    const userHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
            <h1 style="color: #395241; font-size: 24px;">Booking Request Received</h1>
          </div>
          <p>Hi ${name},</p>
          <p>Thank you for your booking request. We have received it and will review it shortly. You will receive another email once your booking is confirmed. Here are the details of your request:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tour Package</td><td style="padding: 10px; border: 1px solid #ddd;">${tour_name}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tour Date</td><td style="padding: 10px; border: 1px solid #ddd;">${tour_date}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Guests</td><td style="padding: 10px; border: 1px solid #ddd;">${guests} (${adults} Adults, ${children} Children)</td></tr>
          </table>
          <p>Best regards,<br>The Sapphire Trails Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `Sapphire Trails <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'Your Booking Request has been Received',
      html: userHtml,
    });

    // Return the response from the PHP backend to the frontend
    return NextResponse.json(savedBooking);

  } catch (error) {
    console.error('Email/Booking API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
