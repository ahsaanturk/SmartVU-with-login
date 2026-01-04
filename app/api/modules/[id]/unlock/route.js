
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CourseProgress from '@/models/CourseProgress';
import Module from '@/models/Module';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
    const unwrapParams = await params;
    const { id: moduleId } = unwrapParams;

    try {
        await dbConnect();

        // Auth Logic
        const cookieStore = await cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const { courseId, passed, score } = await req.json();

        if (!passed) {
            return NextResponse.json({ success: false });
        }

        // 1. Get Module to check order
        const targetModule = await Module.findById(moduleId);
        if (!targetModule) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        // 2. Find all modules in this course with order < targetModule.order
        // effectively unlocking all previous content.
        const previousModules = await Module.find({
            courseId: courseId,
            order: { $lt: targetModule.order }
        }).select('_id');

        const moduleIdsToUnlock = previousModules.map(m => m._id);
        // Also ensure target module is unlocked? User said "modules before this module ... and first lesson of this module unlocked"
        // Usually unlocking the *target* module is implied if you pass its pre-assessment.
        // The prompt says: "I must need to pass pre assessment quizzez of module 2 ... if i passes them, the all lessons and modules before this module and first lesson of this module unlocked."
        // So M2 is unlocked. And M1 is unlocked.
        moduleIdsToUnlock.push(targetModule._id);

        // 4. Update CourseProgress
        let progress = await CourseProgress.findOne({ userId, courseId });
        const User = (await import('@/models/User')).default; // Import User model

        if (!progress) {
            progress = await CourseProgress.create({
                userId,
                courseId,
                unlockedModules: [],
                completedLessons: []
            });
        }

        // Add to unlockedModules using Set to avoid duplicates
        const newUnlockedSet = new Set([
            ...progress.unlockedModules.map(id => id.toString()),
            ...moduleIdsToUnlock.map(id => id.toString())
        ]);
        progress.unlockedModules = Array.from(newUnlockedSet);

        // REMOVED: Do not auto-complete lessons. User wants them "unlocked" (green), not "watched" (yellow).
        // The frontend will handle displaying them as unlocked/active.

        await progress.save();

        // 5. Award XP (10 XP per correct answer)
        let xpGained = 0;
        if (score && typeof score === 'number') {
            xpGained = score * 10;
            if (xpGained > 0) {
                const user = await User.findById(userId);
                if (user) {
                    user.xp = (user.xp || 0) + xpGained;
                    user.weeklyXP = (user.weeklyXP || 0) + xpGained;
                    await user.save();
                }
            }
        }

        return NextResponse.json({ success: true, unlockedModules: progress.unlockedModules, xpGained });

    } catch (error) {
        console.error("Unlock Error:", error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
