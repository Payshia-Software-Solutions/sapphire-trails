import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { format } from 'date-fns';

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

    // Step 2: Fetch tour details to get price for email
    let totalPrice = 0;
    let pricePerPerson = 0;
    try {
        const tourResponse = await fetch(`${API_BASE_URL}/tours/${body.tour_package_id}`);
        if (tourResponse.ok) {
            const tourDetails = await tourResponse.json();
            const priceString = tourDetails?.price || '0';
            pricePerPerson = parseFloat(priceString.replace(/[^0-9.-]+/g,""));
            if (!isNaN(pricePerPerson)) {
                totalPrice = pricePerPerson * (body.adults + body.children);
            }
        }
    } catch (e) {
        console.error("Could not fetch tour price for email, defaulting to 0.", e);
    }


    // Step 3: If saving was successful, send emails using Nodemailer
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
    
    // Consistent styles
    const primaryColor = '#c79954'; // hsl(39, 58%, 74%)
    const backgroundColor = '#0a0a0a';
    const cardColor = '#1c1c1c';
    const textColor = '#e2e8f0';
    const mutedColor = '#a1a1aa';
    const borderColor = '#3f3f46';

    // Email to Admin
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${cardColor}; padding: 30px; border-radius: 8px; border: 1px solid ${borderColor};">
          <div style="text-align: center; border-bottom: 1px solid ${borderColor}; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: ${primaryColor}; font-size: 28px; margin:0;">New Booking Request</h1>
          </div>
          <p style="font-size: 16px;">A new booking request has been submitted. Please review the details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Tour Package</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${tour_name}</td></tr>
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Name</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${name}</td></tr>
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Email</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${email}</td></tr>
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Phone</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${phone || 'N/A'}</td></tr>
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Address</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${address || 'N/A'}</td></tr>
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Tour Date</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${format(new Date(tour_date), 'PPP')}</td></tr>
            <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Guests</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${guests} (${adults} Adults, ${children} Children)</td></tr>
             <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; font-weight: bold; color: ${mutedColor};">Calculated Total</td><td style="padding: 12px 0; text-align: right; font-weight: bold; color: ${primaryColor};">$${totalPrice.toFixed(2)}</td></tr>
            ${message ? `<tr><td style="padding: 12px 0; font-weight: bold; vertical-align: top; color: ${mutedColor};">Message</td><td style="padding: 12px 0; text-align: right; color: ${textColor};">${message}</td></tr>` : ''}
          </table>
          <p style="text-align: center; font-size: 14px; color: ${mutedColor};">Please log in to the admin panel to accept or reject this booking.</p>
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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: transparent; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://content-provider.payshia.com/sapphire-trail/images/logo4.png" alt="Sapphire Trails Logo" style="width: 120px; height: auto;">
          </div>
          <div style="text-align: center;">
            <div style="display: inline-block; background-color: ${primaryColor}; height: 60px; width: 60px; border-radius: 50%; margin-bottom: 15px;">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxYzFjMWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSIyMCA2IDkgMTcgNCAxMiI+PC9wb2x5bGluZT48L3N2Zz4=" alt="Checkmark" style="width: 36px; height: 36px; margin-top: 12px;"/>
            </div>
            <div style="margin-bottom: 20px;">
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yLjcgMTAuM2EyLjQgMi40IDAgMCAwIDAgMy40bDcuNSA3LjVjLjkuOSAyLjUuOSAzLjQgMGw3LjUtNy41YTIuNCAyLjQgMCAwIDAgMC0zLjRsLTcuNS03LjVhMi40IDIuNCAwIDAgMC0zLjQgMFoiLz48L3N2Zz4=" alt="Diamond" style="width: 16px; height: auto; margin: 0 4px;"/>
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yLjcgMTAuM2EyLjQgMi40IDAgMCAwIDAgMy40bDcuNSA3LjVjLjkuOSAyLjUuOSAzLjQgMGw3LjUtNy41YTIuNCAyLjQgMCAwIDAgMC0zLjRsLTcuNS03LjVhMi40IDIuNCAwIDAgMC0zLjQgMFoiLz48L3N2Zz4=" alt="Diamond" style="width: 16px; height: auto; margin: 0 4px;"/>
              <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlPSJoc2woMzksIDU4JSwgNDAlKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0yLjcgMTAuM2EyLjQgMi40IDAgMCAwIDAgMy40bDcuNSA3LjVjLjkuOSAyLjUuOSAzLjQgMGw3LjUtNy41YTIuNCAyLjQgMCAwIDAgMC0zLjRsLTcuNS03LjVhMi40IDIuNCAwIDAgMC0zLjQgMFoiLz48L3N2Zz4=" alt="Diamond" style="width: 16px; height: auto; margin: 0 4px;"/>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 10px 0;">Your Booking is Confirmed!</h1>
            <p style="color: ${mutedColor}; font-size: 16px; max-width: 400px; margin: 0 auto 30px auto;">Hi ${name}, thank you for booking the ${tour_name}. We have received your request and will review it shortly.</p>
          </div>
          
          <div style="background-color: ${cardColor}; border: 1px solid ${borderColor}; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: left;">
            <h2 style="font-size: 20px; font-weight: bold; color: ${textColor}; margin: 0 0 20px 0;">Booking Summary</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; color: ${mutedColor};">Tour Name</td><td style="padding: 12px 0; text-align: right; color: ${textColor}; font-weight: bold;">${tour_name}</td></tr>
              <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; color: ${mutedColor};">Date</td><td style="padding: 12px 0; text-align: right; color: ${textColor}; font-weight: bold;">${format(new Date(tour_date), 'MMMM dd, yyyy')}</td></tr>
              <tr style="border-bottom: 1px solid ${borderColor};"><td style="padding: 12px 0; color: ${mutedColor};">Guests</td><td style="padding: 12px 0; text-align: right; color: ${textColor}; font-weight: bold;">${guests} (${adults} Adults, ${children} Children)</td></tr>
              <tr><td style="padding: 12px 0; color: ${mutedColor};">Total Price</td><td style="padding: 12px 0; text-align: right; color: ${primaryColor}; font-weight: bold; font-size: 18px;">$${totalPrice.toFixed(2)}</td></tr>
            </table>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/profile" target="_blank" style="background-color: ${primaryColor}; color: #000; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 5px; min-width: 150px;">View My Booking</a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tours" target="_blank" style="background-color: transparent; border: 1px solid ${primaryColor}; color: ${primaryColor}; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 5px; min-width: 150px;">Explore More Tours</a>
          </div>
          <div style="text-align: center; padding-top: 30px; font-size: 12px; color: ${mutedColor};">
            <p>Best regards,<br>The Sapphire Trails Team</p>
          </div>
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
