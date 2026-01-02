
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'Quiz', 'Lecture', etc.

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        await dbConnect();

        // Get user's selected courses
        const user = await User.findById(decoded.userId);
        const courses = user.selectedCourses || [];

        if (courses.length === 0) return NextResponse.json({ resources: [] });

        const resources = await Content.find({
            type: type,
            courseCode: { $in: courses }
        }).sort({ createdAt: -1 });

        return NextResponse.json({ resources });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
