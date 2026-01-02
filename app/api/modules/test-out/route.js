
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress';
import Module from '@/models/Module'; // Needed to verify module exists
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();
        const { moduleId, courseId, passed } = await req.json();

        // 1. Auth
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!passed) {
            return NextResponse.json({ success: false, message: 'Quiz failed. Try again.' });
        }

        // 2. Unlock Module
        let progress = await CourseProgress.findOne({ userId, courseId });
        if (!progress) {
            progress = await CourseProgress.create({ userId, courseId });
        }

        if (!progress.unlockedModules.includes(moduleId)) {
            progress.unlockedModules.push(moduleId);
            await progress.save();
        }

        return NextResponse.json({ success: true, message: 'Unit Unlocked!' });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
