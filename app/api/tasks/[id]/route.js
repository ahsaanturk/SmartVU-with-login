
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const task = await Task.findById(id);
        if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ task });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // HOTFIX: Patch Schema if missing
        if (Task.schema && !Task.schema.path('quizQuestions')) {
            Task.schema.add({
                quizQuestions: [{
                    question: String,
                    options: [String],
                    correctAnswer: Number
                }]
            });
        }

        const task = await Task.findByIdAndUpdate(id, body, { new: true });
        if (!task) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ task });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Task.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
