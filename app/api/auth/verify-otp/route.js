
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
    try {
        const { email, otp } = await req.json();
        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.otp || !user.otp.code || !user.otp.expires) {
            return NextResponse.json({ error: 'No OTP requested' }, { status: 400 });
        }

        if (new Date() > new Date(user.otp.expires)) {
            return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
        }

        if (user.otp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        // OTP Valid
        user.isVerified = true;
        user.otp = undefined; // Clear OTP
        await user.save();

        return NextResponse.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
