
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

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const unwrapParams = await params;
        const { id } = unwrapParams;
        const body = await req.json();

        const updatedLesson = await Lesson.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json({ lesson: updatedLesson });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const unwrapParams = await params;
        const { id } = unwrapParams;

        const deletedLesson = await Lesson.findByIdAndDelete(id);

        if (!deletedLesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete lesson' }, { status: 500 });
    }
}
