
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();

        // 1. Authenticate & Identify User
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let userId;
        try {
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
            userId = decoded.userId;
        } catch (e) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // 2. Fetch User Profile
        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 3. Strict Visibility Logic
        // "A course is visible ONLY IF strict match"
        const { degree, semester } = user;

        if (!degree || !semester) {
            return NextResponse.json({ courses: [], warning: 'User Profile Incomplete (missing degree/semester)' });
        }

        const courses = await Course.find({
            allowedPrograms: degree, // Mongoose: checks if 'degree' string exists in 'allowedPrograms' array
            semester: semester      // Exact match
        }).select('code title creditHours allowedPrograms semester'); // Return relevant fields

        return NextResponse.json({
            degree,
            semester,
            count: courses.length,
            courses
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
