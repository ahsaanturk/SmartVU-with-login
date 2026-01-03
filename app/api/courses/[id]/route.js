
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';

// Force Cache Refresh
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Next.js 15+ params await
        const { id } = await params;

        const course = await Course.findById(id);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Fetch Modules (formerly chapters)
        const modules = await Module.find({ courseId: id }).sort({ order: 1 });

        // Fetch all lessons for these modules
        const moduleIds = modules.map(m => m._id);
        const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });

        // Structure the data: Module -> Lessons
        const hierarchy = modules.map(module => {
            const moduleLessons = lessons.filter(l => l.moduleId.toString() === module._id.toString());
            return {
                ...module.toObject(),
                lessons: moduleLessons
            };
        });

        return NextResponse.json({
            course,
            modules: hierarchy
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch course details' }, { status: 500 });
    }
}
