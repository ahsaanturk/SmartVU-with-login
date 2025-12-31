
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserTaskStatus from '@/models/UserTaskStatus';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { taskId } = await req.json();
        await dbConnect();

        // Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Create Status
        await UserTaskStatus.create({
            userId,
            taskId,
            status: 'Completed',
            completionDate: new Date()
        });

        // Update Streak
        const user = await User.findById(userId);
        const today = new Date();
        const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;

        let streakUpdated = false;
        // Check if studied today
        const isSameDay = lastDate && (
            lastDate.getDate() === today.getDate() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getFullYear() === today.getFullYear()
        );

        if (!isSameDay) {
            // Basic check: if studied yesterday, increment. If gap > 1 day, reset? 
            // For MVP simplicity: just increment.
            user.streakDays += 1;
            user.lastStudyDate = today;
            await user.save();
            streakUpdated = true;
        }

        return NextResponse.json({ message: 'Task Completed', streakUpdated, newStreak: user.streakDays });

    } catch (error) {
        if (error.code === 11000) { // Duplicate key
            return NextResponse.json({ message: 'Already completed' });
        }
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
