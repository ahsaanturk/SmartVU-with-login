
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseProgress from '@/models/CourseProgress';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const courseId = id;

        // Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Fetch User for Streak/XP
        const user = await User.findById(userId).select('streakDays xp');

        // Fetch Course Progress
        const progress = await CourseProgress.findOne({ userId, courseId });

        return NextResponse.json({
            progress: {
                completedLessons: progress ? progress.completedLessons : [],
                unlockedModules: progress ? progress.unlockedModules : [],
                streak: user?.streakDays || 0,
                xp: user?.xp || 0
            }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
