
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import Module from '@/models/Module';
import Lesson from '@/models/Lesson';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { syncCourseGroup } from '@/lib/services/groupService';

// Helper to check Admin Role
async function checkAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    if (!token) return false;
    try {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        return user && user.role === 'admin';
    } catch (e) {
        return false;
    }
}

// UPDATE Course
export async function PUT(req, { params }) {
    try {
        await dbConnect();

        // 1. Security Check
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { code, name, semester, allowedPrograms, description, creditHours, handouts } = body;

        // 2. Validate
        if (!code || !name || !semester || !allowedPrograms || !Array.isArray(allowedPrograms)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 3. Update
        const course = await Course.findByIdAndUpdate(
            id,
            {
                code,
                name,
                semester,
                allowedPrograms,
                description,
                creditHours: creditHours || 3,
                handouts: handouts || [] // Save handouts
            },
            { new: true }
        );

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // 4. Sync Group
        await syncCourseGroup(course._id);

        return NextResponse.json({ success: true, course });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE Course (Secure)
export async function DELETE(req, { params }) {
    try {
        await dbConnect();

        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;

        // Cascade delete modules/lessons
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        const modules = await Module.find({ courseId: id });
        const moduleIds = modules.map(m => m._id);

        await Module.deleteMany({ courseId: id });
        await Lesson.deleteMany({ moduleId: { $in: moduleIds } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
