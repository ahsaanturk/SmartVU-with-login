
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';




export async function GET(req, { params }) {
    const unwrapParams = await params;
    const { id } = unwrapParams;

    try {
        await dbConnect();
        const module = await Module.findById(id);

        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json({ module });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const unwrapParams = await params;
    const { id } = unwrapParams;

    try {
        await dbConnect();
        const body = await req.json();

        // Prevent modification of courseId via this route if deemed unsafe, 
        // but generally we just update fields passed.
        const updatedModule = await Module.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true } // Return updated doc
        );

        if (!updatedModule) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json({ module: updatedModule });
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    const unwrapParams = await params;
    const { id } = unwrapParams;

    try {
        await dbConnect();

        // Check if module exists
        const module = await Module.findById(id);
        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        // 1. Delete all lessons associated with this module
        // We need to import Lesson model to do this.
        // Dynamic import to avoid circular dependency issues if any, though likely safe here.
        const Lesson = (await import('@/models/Lesson')).default;
        await Lesson.deleteMany({ moduleId: id });

        // 2. Delete the module itself
        await Module.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Module and associated lessons deleted successfully' });
    } catch (error) {
        console.error("Delete Module Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
