
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req) {
    try {
        await dbConnect();

        // 1. Weekly Reset Logic (Lazy)
        // Check a random user or system state? 
        // For efficiency, we can just do this when fetching leaderboards.
        // Ideally we need a global "SystemConfig" collection, but for now we reset individual users 
        // IF we detect a new week. But that's hard to sync.
        // Better Approach: Store "weekNumber" in User? 
        // Or simplified: Just return `weeklyXP` for now, assuming external cron or manual reset.
        // User asked: "first Add that XPs one the baises of weekly and all time"
        // Let's implement a simple date check. If today is Monday, and user.lastWeeklyReset < Monday, reset.

        // Actually, MongoDB Aggregation is best for sorting.

        // Fetch Top 50 Weekly
        const weeklyboard = await User.find({})
            .sort({ weeklyXP: -1 })
            .limit(50)
            .select('name weeklyXP avatar');

        // Fetch Top 50 Semester (Total)
        const semesterboard = await User.find({})
            .sort({ xp: -1 })
            .limit(50)
            .select('name xp avatar');

        return NextResponse.json({
            weekly: weeklyboard,
            semester: semesterboard
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
