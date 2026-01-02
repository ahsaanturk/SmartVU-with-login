
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();

        // We expect lessonId, but for streak purposes we just need to know they finished 'something' valid.
        const { lessonId } = await req.json();

        // Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Streak Logic
        const today = new Date();
        const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;

        let streakUpdated = false;

        // Check if already studied today
        const isSameDay = lastDate && (
            lastDate.getDate() === today.getDate() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getFullYear() === today.getFullYear()
        );

        if (!isSameDay) {
            // Check if studied yesterday to maintain streak, otherwise reset (strictly speaking)
            // But for this MVP let's just increment if they show up.
            // Or better: Check if today - lastDate <= 2 days (approx 48 hrs)

            user.streakDays = (user.streakDays || 0) + 1;
            user.lastStudyDate = today;
            streakUpdated = true;
        }

        // We could also save a "UserLessonProgress" here if we want to track WHICH lessons are done.
        // For now, updating streak is the priority.

        await user.save();

        return NextResponse.json({
            success: true,
            streakUpdated,
            newStreak: user.streakDays
        });

    } catch (error) {
        console.error('Lesson Complete Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
