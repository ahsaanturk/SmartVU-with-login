
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email } = await req.json();
        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            // For security, we might want to return success even if user doesn't exist to prevent enumeration.
            // But for this project, let's be explicit.
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = { code: otpCode, expires };
        await user.save();

        // Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset Your SmartVU Password',
            text: `Hello ${user.name},\n\nYou requested a password reset. Your OTP code is ${otpCode}.\n\nIt expires in 10 minutes.\n\nBest,\nSmartVU Team`
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Forgot Password Request Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
