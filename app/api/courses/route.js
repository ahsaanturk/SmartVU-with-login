
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const degree = searchParams.get('degree');
        const semester = searchParams.get('semester');

        const query = {};

        // Fix: Cast semester to Number because Schema uses Number
        if (semester) query.semester = parseInt(semester);

        // Fix: Case-insensitive match for allowedPrograms? 
        // Ideally we keep it strict, but ensuring no whitespace
        if (degree) query.allowedPrograms = degree.trim();

        // Debug log (Server side)
        console.log(`Searching Courses:`, query);

        const courses = await Course.find(query).sort({ code: 1 });
        return NextResponse.json({ courses });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Basic Validation
        if (!body.name || !body.code || !body.degree) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Ensure degree is array
        const degreeArray = Array.isArray(body.degree) ? body.degree : [body.degree];

        const course = await Course.create({ ...body, degree: degreeArray });
        return NextResponse.json({ course }, { status: 201 });
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Course code already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
