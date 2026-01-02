
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { syncStudentGroups } from '@/lib/services/groupService';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const {
            name,
            email,
            password,
            university,
            degreeLevel,
            degree,
            semester
        } = await req.json();
        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.isVerified) {
            return NextResponse.json({ error: 'User not verified' }, { status: 403 });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.name = name; // Update name just in case
        user.password = hashedPassword;
        user.university = university;
        user.degreeLevel = degreeLevel;
        user.degree = degree;
        user.semester = semester;

        await user.save();

        // 4. Sync Course Groups (New Architecture)
        // Automatically add student to relevant CourseGroups based on Degree/Semester
        await syncStudentGroups(user._id);

        // Create Session
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set Cookie
        (await cookies()).set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/',
        });

        return NextResponse.json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Register Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
