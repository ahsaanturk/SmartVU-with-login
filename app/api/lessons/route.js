
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lesson from '@/models/Lesson';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Validate
        if (!body.moduleId || !body.title || !body.summary) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (body.type === 'Text' && !body.textContent) {
            return NextResponse.json({ error: 'Text content is required for Text lessons' }, { status: 400 });
        }

        if ((!body.type || body.type === 'Video') && !body.videoUrl) {
            return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
        }

        const lesson = await Lesson.create(body);
        return NextResponse.json({ lesson }, { status: 201 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
