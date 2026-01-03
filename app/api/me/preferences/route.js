
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json(); // { emailNotifications: boolean }

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: { emailNotifications: body.emailNotifications } },
            { new: true }
        );

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error('Preferences Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
