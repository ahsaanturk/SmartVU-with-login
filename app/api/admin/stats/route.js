
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Course from '@/models/Course';
import Content from '@/models/Content';
import Task from '@/models/Task';

export async function GET() {
    try {
        await dbConnect();

        const [users, courses, content, tasks] = await Promise.all([
            User.countDocuments({}),
            Course.countDocuments({}),
            Content.countDocuments({}),
            Task.countDocuments({})
        ]);

        return NextResponse.json({
            users,
            courses,
            content,
            tasks
        });
    } catch (error) {
        return NextResponse.json({ error: 'Stats falied' }, { status: 500 });
    }
}
