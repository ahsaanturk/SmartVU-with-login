
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Task from '@/models/Task';
import UserTaskStatus from '@/models/UserTaskStatus';
import Content from '@/models/Content';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

        // 1. Fetch Active Tasks (Pending) - Filtered by Enrolled Courses & Future Due Date
        const userCourses = user.selectedCourses || [];
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Include today's tasks

        const tasks = await Task.find({
            courseCode: { $in: userCourses },
            dueDate: { $gte: now }
        }).sort({ dueDate: 1 });

        // Filter out completed ones
        const completedStatuses = await UserTaskStatus.find({ userId, status: 'Completed' });
        const completedTaskIds = completedStatuses.map(s => s.taskId.toString());

        const activeTasks = tasks.filter(t => {
            const isCompleted = completedTaskIds.includes(t._id.toString());
            const isOverdue = new Date(t.dueDate) < new Date();
            // We want tasks that are NOT completed AND NOT overdue.
            // Actually, tasks query already checks `dueDate: { $gte: now }`.
            // `now` is set to today 00:00:00.
            // If a task was due yesterday (e.g. 23:59), it is excluded by `$gte: now`.
            // If a task is due TODAY at 10:00AM, and it is now 11:00AM.
            // `dueDate` logic in DB usually stores full datetime.
            // The query `$gte: now` (start of day) includes tasks due today.
            // We need to filter out tasks that are technically overdue by TIME if we want strict hiding?
            // "When task/alert become overdue it must disapear".
            // Let's rely on the DB query for DATE level filtering.
            // Line 35: `dueDate: { $gte: now }` where now is 00:00:00.
            // This includes tasks due today.
            // If the user means "strictly overdue right now", we should use `Date.now()`.
            // Let's enable strict filtering.

            return !isCompleted && new Date(t.dueDate) > new Date();
        });

        // 2. Fetch Leaderboard (Same Semester, Sorted by XP)
        const leaderboard = await User.find({
            role: 'student',
            semester: user.semester,
            // Exclude current user? No, usually you want to see yourself in the list if you are top.
        })
            .sort({ xp: -1 })
            .limit(10)
            .select('name xp semester degree'); // Lean select

        // 3. Fetch Quote
        const quote = await Content.findOne({ type: 'Quote' }).sort({ date: -1 });

        // 4. Fetch Concept
        const concept = await Content.findOne({ type: 'Concept' }).sort({ date: -1 });

        return NextResponse.json({
            user: {
                name: user.name,
                streak: user.streakDays,
                xp: user.xp || 0,
                semester: user.semester
            },
            leaderboard,
            tasks: activeTasks.slice(0, 5), // Top 5 urgent
            quote: quote || { description: "Keep pushing forward!", author: "SmartVU" },
            concept: concept || { title: "Daily Concept", description: "No concept for today." }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
