
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email, name } = await req.json();
        await dbConnect();

        // Generate 6 digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            if (user.isVerified && user.password) {
                // If user is already fully registered, we might want to prevent re-registration or handle password reset.
                // For this flow (Signup), we assume new users. 
                // But let's allow re-verification if they didn't set password or just update OTP.
                // If they have password, return error saying email exists.
                return NextResponse.json({ error: 'User already exists using this email.' }, { status: 400 });
            }

            // Update existing unverified user
            user.otp = { code: otpCode, expires };
            user.name = name; // Update name in case they corrected it
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                otp: { code: otpCode, expires },
                isVerified: false
            });
        }

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
            subject: 'Your SmartVU OTP Code',
            text: `Hello ${name},\n\nYour OTP code is ${otpCode}.\n\nIt expires in 10 minutes.\n\nBest,\nSmartVU Team`
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
    }
}
