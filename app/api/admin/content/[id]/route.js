
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const content = await Content.findById(id);
        if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deleted = await Content.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const content = await Content.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ content });
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
