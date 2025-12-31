
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Task from '@/models/Task';
import UserTaskStatus from '@/models/UserTaskStatus';
import Content from '@/models/Content';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        await dbConnect();

        // Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);

        // 1. Fetch Active Tasks (Pending)
        // For MVP, we fetch ALL pending tasks. In real app, filter by User's selected courses.
        const tasks = await Task.find({}).sort({ dueDate: 1 }); // limit?

        // Filter out completed ones
        const completedStatuses = await UserTaskStatus.find({ userId, status: 'Completed' });
        const completedTaskIds = completedStatuses.map(s => s.taskId.toString());

        const activeTasks = tasks.filter(t => !completedTaskIds.includes(t._id.toString()));

        // 2. Fetch Quote
        const quote = await Content.findOne({ type: 'Quote' }).sort({ date: -1 });

        // 3. Fetch Concept
        const concept = await Content.findOne({ type: 'Concept' }).sort({ date: -1 });

        return NextResponse.json({
            user: {
                name: user.name,
                streak: user.streakDays
            },
            tasks: activeTasks.slice(0, 5), // Top 5 urgent
            quote: quote || { description: "Keep pushing forward!", author: "SmartVU" },
            concept: concept || { title: "Daily Concept", description: "No concept for today." }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
