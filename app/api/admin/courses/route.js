
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
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

export async function POST(req) {
    try {
        await dbConnect();

        // 1. Security Check
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized: Admin Access Required' }, { status: 403 });
        }

        // 2. Validate Payload
        const body = await req.json();
        const { code, name, semester, allowedPrograms, description, creditHours } = body;

        if (!code || !name || !semester || !allowedPrograms || !Array.isArray(allowedPrograms) || allowedPrograms.length === 0) {
            return NextResponse.json({ error: 'Invalid Payload: code, name, semester, allowedPrograms (array) required' }, { status: 400 });
        }

        // 3. Create Course
        // Using upsert to prevent duplicates or just create
        const course = await Course.findOneAndUpdate(
            { code },
            {
                code,
                name,
                semester,
                allowedPrograms,
                description,
                creditHours: creditHours || 3,
                status: 'active'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // 4. Update Course Group
        await syncCourseGroup(course._id);

        return NextResponse.json({ success: true, course });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
