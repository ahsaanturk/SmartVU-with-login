
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import CourseProgress from '@/models/CourseProgress';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        await dbConnect();

        const user = await User.findById(decoded.userId).select('-password -otp');

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Lazy Streak Reset:
        // If last study date was BEFORE yesterday, the streak is broken.
        // We reset it to 0 so the user sees "0 Streak" instead of a stale number.
        if (user.lastStudyDate && user.streakDays > 0) {
            const lastDate = new Date(user.lastStudyDate);
            const today = new Date();

            // Normalize to midnight for accurate day difference
            const d1 = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
            const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const diffTime = Math.abs(d2 - d1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // diffDays = 0 (Today) -> OK
            // diffDays = 1 (Yesterday) -> OK (Streak active, pending today)
            // diffDays >= 2 (Day before yesterday or older) -> BROKEN
            if (diffDays >= 2) {
                user.streakDays = 0;
                await user.save();
            }
        }

        // Calculate detailed stats
        const progressDocs = await CourseProgress.find({ userId: decoded.userId });

        let totalLessonsCompleted = 0;
        let firstTryPasses = 0;

        progressDocs.forEach(p => {
            // Count completed
            totalLessonsCompleted += p.completedLessons.length;

            // Calculate accuracy using lessonAttempts
            // A lesson is "First Try" if it's in completedLessons AND (not in attempts OR failedCount == 0)
            const attemptsMap = p.lessonAttempts || new Map();

            p.completedLessons.forEach(lessonId => {
                const idStr = lessonId.toString();
                const attempt = attemptsMap.get(idStr);
                if (!attempt || attempt.failedCount === 0) {
                    firstTryPasses++;
                }
            });
        });

        const accuracy = totalLessonsCompleted > 0
            ? Math.round((firstTryPasses / totalLessonsCompleted) * 100)
            : 0; // Default to 0 or maybe 100 if no lessons? 0 is safer.

        // Return enriched user object
        return NextResponse.json({
            user: {
                ...user.toObject(),
                stats: {
                    lessonsCompleted: totalLessonsCompleted,
                    quizAccuracy: accuracy,
                    coursesEnrolled: user.selectedCourses?.length || 0
                }
            }
        });

    } catch (error) {
        console.error('API Me Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
