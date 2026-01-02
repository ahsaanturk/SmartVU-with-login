
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lesson from '@/models/Lesson';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Next.js 15+
        const { id } = await params;

        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json({ lesson });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch lesson' }, { status: 500 });
    }
}
