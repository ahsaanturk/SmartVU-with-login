
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { cookies } from 'next/headers'; // Normally verify auth

export async function POST(req) {
    try {
        const { subject, message, courseCode } = await req.json();

        // In real app, get user email from session
        // const userEmail = ...

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Mock Instructor Email - sends to self for MVP
        const instructorEmail = process.env.EMAIL_USER;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: instructorEmail,
            replyTo: process.env.EMAIL_USER, // user's email
            subject: `[SmartVU] Missed Task Help: ${courseCode} - ${subject}`,
            text: message
        });

        return NextResponse.json({ message: 'Email sent to instructor' });
    } catch (error) {
        console.error('Email Error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
