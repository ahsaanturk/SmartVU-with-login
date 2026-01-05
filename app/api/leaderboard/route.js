
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

        // 1. Calculate Rolling 7-Day Window
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Today - 6 days = 7 days window
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);

        // Fetch Top 50 Weekly using Aggregation
        const weeklyboard = await User.aggregate([
            {
                $addFields: {
                    weeklyXP: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: { $ifNull: ["$dailyXP", []] },
                                        as: "entry",
                                        cond: { $gte: ["$$entry.date", sevenDaysAgo] }
                                    }
                                },
                                as: "filteredEntry",
                                in: "$$filteredEntry.xp"
                            }
                        }
                    }
                }
            },
            { $sort: { weeklyXP: -1 } },
            { $limit: 50 },
            { $project: { name: 1, weeklyXP: 1, avatar: 1 } }
        ]);

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
