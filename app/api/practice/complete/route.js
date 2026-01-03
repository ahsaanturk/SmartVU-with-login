
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import UserTaskStatus from '@/models/UserTaskStatus';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
    try {
        const { taskId, answers } = await req.json(); // answers: { 0: 1, 1: 0, ... }

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        await dbConnect();

        // 1. Fetch Task
        const task = await Task.findById(taskId);
        if (!task || !task.quizQuestions || task.quizQuestions.length === 0) {
            return NextResponse.json({ error: 'Invalid Task' }, { status: 404 });
        }

        // 2. Calculate Score
        let correctCount = 0;
        task.quizQuestions.forEach((q, index) => {
            const userAns = answers[index];
            if (userAns !== undefined && userAns === q.correctAnswer) {
                correctCount++;
            }
        });

        const total = task.quizQuestions.length;
        const scorePercent = (correctCount / total) * 100;
        const passed = scorePercent >= 80;

        // 3. Check/Create UserTaskStatus
        let status = await UserTaskStatus.findOne({ userId, taskId });
        if (!status) {
            status = await UserTaskStatus.create({
                userId,
                taskId,
                status: 'Pending', // Default
            });
        }

        let xpGained = 0;

        // 4. Handle Completion & XP (Only if Passed)
        if (passed) {
            // Check if already completed
            if (status.status !== 'Completed') {
                // First time completion
                // Rule: "student give XP how much he give correct answer" 
                // Let's assume 5 XP per correct answer? Or 60 flat? 
                // User said: "Practice quiz that may be 5, 10 or 20 [questions]... give XP how much he give correct answer"
                // Let's implement 5 XP per Correct Answer.
                xpGained = correctCount * 5;

                status.status = 'Completed';
                status.completedAt = new Date();
                status.score = scorePercent; // Optional field if schema supports, but simple for now
                await status.save();

                // Update User XP
                await User.findByIdAndUpdate(userId, { $inc: { xp: xpGained, weeklyXP: xpGained } }); // Update both
            } else {
                // Already completed 
                // "he is authrouzed to practice as more as he/she whant"
                // No extra XP for repeat practice of Alerts (implied by "only first time he will get XP")
            }
        }

        return NextResponse.json({
            success: true,
            score: correctCount,
            total,
            scorePercent,
            passed,
            xpGained
        });

    } catch (error) {
        console.error('Practice Submit Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
