
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

        const isReattempt = progress.completedLessons.includes(lessonId);

        if (quizCorrect) {
            success = true;
            if (isReattempt) {
                xpGained = 4; // Repeat Pass
            } else {
                xpGained = 60; // First Pass
            }

            // Mark Lesson Complete
            if (!progress.completedLessons.includes(lessonId)) {
                progress.completedLessons.push(lessonId);
            }
        } else {
            if (isReattempt) {
                xpGained = 2; // Repeat Fail
            } else {
                xpGained = 15; // First Fail
            }

            // Record Fail
            const currentFails = lessonStat ? lessonStat.failedCount : 0;
            attempts.set(lessonId, {
                lastAttempt: new Date(),
                failedCount: currentFails + 1
            });
            progress.lessonAttempts = attempts; // Mongoose requirement
        }

        // 5. Update User XP & Streak
        user.xp = (user.xp || 0) + xpGained;
        user.weeklyXP = (user.weeklyXP || 0) + xpGained;

        // Streak Logic (Strict: Only on Final Quiz, Once per Day)
        const today = new Date();
        const lastDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
        let streakUpdated = false;

        // Normalizing function to ignore time components for date comparison
        const isSameDay = (d1, d2) => {
            return d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getFullYear() === d2.getFullYear();
        };

        const isYesterday = (d1, d2) => {
            const yesterday = new Date(d1);
            yesterday.setDate(d1.getDate() - 1);
            return isSameDay(yesterday, d2);
        };

        // Initialize history if missing
        if (!user.streakHistory) {
            user.streakHistory = [];
        }

        if (!lastDate) {
            // First time ever
            user.streakDays = 1;
            user.lastStudyDate = today;
            user.streakHistory.push(today);
            streakUpdated = true;
        } else if (!isSameDay(today, lastDate)) {
            // Not today, so potentially actionable
            if (isYesterday(today, lastDate)) {
                // Continuation
                user.streakDays = (user.streakDays || 0) + 1;
                streakUpdated = true;
            } else {
                // Broken streak
                user.streakDays = 1; // Reset to 1 (today counts)
                // streakUpdated is implicitly true for user feedback, as they "gained a day" roughly,
                // but strictly speaking they lost the big number. 
                // Let's return true so they see the fire animation for "Streak Active" today.
                streakUpdated = true;
            }

            user.lastStudyDate = today;
            user.streakHistory.push(today);

            // Cleanup history (keep last 60 days to avoid bloat, we only need ~7-30 for UI)
            if (user.streakHistory.length > 60) {
                user.streakHistory = user.streakHistory.slice(-60);
            }
        }
        // If isSameDay (today), do nothing. Streak already counted for today.

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
