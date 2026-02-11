import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const API_BASE_URL = 'https://server-sapphiretrails.payshia.com';

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, message } = body;

  try {
    // Step 1: Forward the data to the PHP backend to save it
    const phpResponse = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
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

    // Email to Admin
    await transporter.sendMail({
      from: `"${name}" <${process.env.MAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      text: `You have received a new message from your website contact form.\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
      html: `<p>You have received a new message from your website contact form.</p>
             <h3>Details:</h3>
             <ul>
               <li><strong>Name:</strong> ${name}</li>
               <li><strong>Email:</strong> ${email}</li>
             </ul>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br>')}</p>`,
    });

    // Confirmation Email to User
    await transporter.sendMail({
      from: `Sapphire Trails <${process.env.MAIL_FROM}>`,
      to: email,
      subject: 'We have received your message',
      text: `Hi ${name},\n\nThank you for contacting us. We have received your message and will get back to you shortly.\n\nYour message:\n${message}\n\nBest regards,\nThe Sapphire Trails Team`,
      html: `<p>Hi ${name},</p>
             <p>Thank you for contacting us. We have received your message and will get back to you shortly.</p>
             <p><strong>Your message:</strong></p>
             <p><em>${message.replace(/\n/g, '<br>')}</em></p>
             <p>Best regards,<br>The Sapphire Trails Team</p>`,
    });

    return NextResponse.json({ message: 'Submission successful and emails sent.' });

  } catch (error) {
    console.error('Email/Contact API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
