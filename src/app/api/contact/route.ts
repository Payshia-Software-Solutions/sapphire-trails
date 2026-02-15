import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message, tourInterest } = body;

  try {
    // Step 1: Forward the data to the PHP backend to save it
    const phpResponse = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, tour_interest: tourInterest }),
    });

    if (!phpResponse.ok) {
      const errorData = await phpResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save contact submission to the database.');
    }
    
    // Step 2: If saving was successful, send emails using Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const primaryColor = '#c79954';
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
            <h1 style="color: ${primaryColor}; font-size: 28px; margin:0;">New Contact Message</h1>
          </div>
          <p style="font-size: 16px;">You have received a new message from your website contact form.</p>
          <div style="background-color: ${backgroundColor}; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="font-size: 14px; margin: 0 0 10px 0;"><strong style="color: ${mutedColor};">From:</strong> ${name} &lt;${email}&gt;</p>
            ${tourInterest ? `<p style="font-size: 14px; margin: 0 0 15px 0;"><strong style="color: ${mutedColor};">Tour Interest:</strong> ${tourInterest}</p>` : ''}
            <p style="font-size: 16px; white-space: pre-wrap; margin: 0;">${message}</p>
          </div>
          <p style="text-align: center; font-size: 14px; color: ${mutedColor};">You can reply directly to this email to respond.</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Sapphire Trails Contact" <${process.env.MAIL_FROM}>`,
      to: "reservation@silverray.lk, info@silverray.lk",
      cc: "nupasena@kdugroup.com",
      bcc: "thilinaruwan112@gmail.com",
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      html: adminHtml,
    });

    // Confirmation Email to User
    const userHtml = `
       <div style="font-family: Arial, sans-serif; line-height: 1.6; color: ${textColor}; background-color: ${backgroundColor}; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${cardColor}; padding: 30px; border-radius: 8px; border: 1px solid ${borderColor};">
          <div style="text-align: center; margin-bottom: 20px;">
             <img src="https://content-provider.payshia.com/sapphire-trail/images/logo4.png" alt="Sapphire Trails Logo" style="width: 120px; height: auto;">
          </div>
          <div style="text-align: center; border-bottom: 1px solid ${borderColor}; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: ${textColor}; font-size: 28px; margin:0;">Thank You, ${name}</h1>
          </div>
          <p style="font-size: 16px; color: ${mutedColor}; text-align: center;">We have received your message and will get back to you shortly. Here is a copy of your inquiry:</p>
          <div style="background-color: ${backgroundColor}; border-radius: 8px; padding: 20px; margin: 25px 0; border: 1px solid ${borderColor};">
            ${tourInterest ? `<p style="font-size: 14px; margin: 0 0 15px 0;"><strong style="color: ${mutedColor};">Tour Interest:</strong> ${tourInterest}</p>` : ''}
            <p style="font-size: 14px; white-space: pre-wrap; margin: 0; font-style: italic;">"${message}"</p>
          </div>
          <p style="text-align: center; font-size: 14px; color: ${mutedColor};">Best regards,<br>The Sapphire Trails Team</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `Sapphire Trails <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'We have received your message',
      html: userHtml,
    });

    return NextResponse.json({ message: 'Submission successful and emails sent.' });

  } catch (error) {
    console.error('Email/Contact API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
