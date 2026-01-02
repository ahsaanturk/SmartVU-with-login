
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        await dbConnect();

        const { lessonId, courseId, quizCorrect } = await req.json();

        // 1. Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // 2. Fetch Progress
        let progress = await CourseProgress.findOne({ userId, courseId });
        if (!progress) {
            progress = await CourseProgress.create({ userId, courseId });
        }

        // 3. Lockout Logic (Check last attempt)
        // Access map safely. Mongoose Maps require .get()
        const attempts = progress.lessonAttempts || new Map();
        const lessonStat = attempts.get(lessonId);

        if (lessonStat && !quizCorrect) {
            const lastAttemptTime = new Date(lessonStat.lastAttempt).getTime();
            const now = Date.now();
            const diffMinutes = (now - lastAttemptTime) / 60000;

            // If failed previously and less than 2 minutes have passed
            if (diffMinutes < 2) {
                const remainingSeconds = Math.ceil((2 - diffMinutes) * 60);
                return NextResponse.json({
                    error: 'Locked',
                    message: 'You must rewatch the lesson before retrying.',
                    remainingSeconds
                }, { status: 429 });
            }
        }

        // 4. Update Stats & XP
        let xpGained = 0;
        let success = false;

        if (quizCorrect) {
            xpGained = 60;
            success = true;

            // Mark Lesson Complete
            if (!progress.completedLessons.includes(lessonId)) {
                progress.completedLessons.push(lessonId);
            }
        } else {
            xpGained = 30; // Consolation XP
            // Record Fail
            const currentFails = lessonStat ? lessonStat.failedCount : 0;
            attempts.set(lessonId, {
                lastAttempt: new Date(),
                failedCount: currentFails + 1
            });
            progress.lessonAttempts = attempts; // Mongoose requirement to trigger save
        }

        // 5. Update User XP & Streak
        user.xp = (user.xp || 0) + xpGained;

        // Streak Logic
        const today = new Date();
        const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
        let streakUpdated = false;

        const isSameDay = lastDate && (
            lastDate.getDate() === today.getDate() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getFullYear() === today.getFullYear()
        );

        if (!isSameDay) {
            // Check concurrency: if lastDate was yesterday, increment. Else reset.
            // Simplified logic: Just increment if not same day for MVP.
            user.streakDays = (user.streakDays || 0) + 1;
            user.lastStudyDate = today;
            streakUpdated = true;
        }

        await user.save();
        await progress.save();

        return NextResponse.json({
            success,
            xpGained,
            totalXp: user.xp,
            streakUpdated,
            newStreak: user.streakDays,
            lessonId
        });

    } catch (error) {
        console.error('Completion Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
