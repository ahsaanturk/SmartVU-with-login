import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserTaskStatus from '@/models/UserTaskStatus';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { taskId } = await req.json();
        if (!taskId) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

        // Update or Create status as 'Deleted'
        await UserTaskStatus.findOneAndUpdate(
            { userId, taskId },
            { status: 'Deleted' },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete Task Error:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
