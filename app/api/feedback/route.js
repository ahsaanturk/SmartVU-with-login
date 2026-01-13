import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();

        // Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { message, type } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        await Feedback.create({
            userId,
            message,
            type: type || 'General'
        });

        return NextResponse.json({ success: true, message: 'Feedback submitted successfully' });

    } catch (error) {
        console.error('Feedback API Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
