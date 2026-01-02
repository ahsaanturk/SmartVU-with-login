import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Validate
        if (!body.courseId || !body.title || body.order === undefined) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const module = await Module.create(body);
        return NextResponse.json({ module }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
