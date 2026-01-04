
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress'; // Import Progress Model
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();

        // Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Cooldown Check (3 Months)
        const now = new Date();
        if (user.lastPromotionDate) {
            const lastDate = new Date(user.lastPromotionDate);
            const diffTime = Math.abs(now - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 3 Months ~ 90 Days
            if (diffDays < 90) {
                const remaining = 90 - diffDays;
                return NextResponse.json({
                    error: `You can only promote once every 3 months. Available in ${remaining} days.`
                }, { status: 400 });
            }
        }

        // Logic: Increment Semester
        if (user.semester >= 8) {
            return NextResponse.json({ error: 'You are already in the final semester!' }, { status: 400 });
        }

        user.semester = (user.semester || 1) + 1;
        user.lastPromotionDate = now;

        // --- RESET LOGIC ---
        // 1. Clear selected courses so the user can choose new ones for the new semester
        user.selectedCourses = [];
        user.selectedCourseIds = [];

        // 2. Clear Course Progress (Resets "Lessons Done" & "Quiz Accuracy" stats)
        // This gives the "fresh start" feeling for the new semester.
        // XP and Streak are preserved on the User model.
        await CourseProgress.deleteMany({ userId: userId });

        await user.save();

        return NextResponse.json({
            success: true,
            semester: user.semester,
            message: `Congratulations! You have been promoted to Semester ${user.semester}. Courses and Progress have been reset.`
        });

    } catch (error) {
        console.error('Promotion Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
