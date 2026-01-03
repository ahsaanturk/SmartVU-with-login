
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import UserTaskStatus from '@/models/UserTaskStatus';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { taskId } = await req.json();

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await dbConnect();

        // 1. Fetch Task
        const task = await Task.findById(taskId);
        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

        // 2. Check/Create UserTaskStatus
        let status = await UserTaskStatus.findOne({ userId, taskId });
        if (!status) {
            status = await UserTaskStatus.create({
                userId,
                taskId,
                status: 'Completed',
                completedAt: new Date()
            });
        } else {
            // Already completed? No XP if so.
            if (status.status === 'Completed') {
                return NextResponse.json({ success: true, message: 'Already completed' });
            }
            status.status = 'Completed';
            status.completedAt = new Date();
            await status.save();
        }

        // 3. Award XP (Flat 10 XP for non-quiz tasks)
        // If it was a Quiz, it should have gone through /api/practice/complete!
        // But if they just mark a regular alert as done, give them small XP.
        const xpGained = 10;
        await User.findByIdAndUpdate(userId, {
            $inc: { xp: xpGained, weeklyXP: xpGained }
        });

        // 4. Update Streak (Removed - functionality moved to Lecture Logic)
        // await User.findByIdAndUpdate(userId, { $inc: { streakDays: 1 } }); 

        return NextResponse.json({ success: true, xpGained });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
