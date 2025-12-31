
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import UserTaskStatus from '@/models/UserTaskStatus';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status') || 'Pending';

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (statusFilter === 'Pending') {
            // Get all tasks NOT in UserTaskStatus(Completed/Missed)
            const allTasks = await Task.find({}).sort({ dueDate: 1 });
            const statuses = await UserTaskStatus.find({ userId });
            // Filter
            const doneIds = statuses.map(s => s.taskId.toString());
            const pendingTasks = allTasks.filter(t => !doneIds.includes(t._id.toString()));
            return NextResponse.json({ tasks: pendingTasks });
        }
        else {
            // Get tasks FROM UserTaskStatus
            const statuses = await UserTaskStatus.find({ userId, status: statusFilter }).populate('taskId');
            const tasks = statuses.map(s => s.taskId);
            return NextResponse.json({ tasks });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
    }
}

// Admin Mock Create
export async function POST(req) {
    try {
        const body = await req.json();
        await dbConnect();
        const task = await Task.create(body);
        return NextResponse.json({ task });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
