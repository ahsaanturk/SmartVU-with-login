
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import UserTaskStatus from '@/models/UserTaskStatus';

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Task.findByIdAndDelete(id);
        // Clean up status records
        await UserTaskStatus.deleteMany({ taskId: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
