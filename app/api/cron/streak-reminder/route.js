
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { getStreakReminderTemplate } from '@/lib/emailTemplates';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    // 1. Security Check (Vercel Cron)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow local testing if no secret is set, OR strict check in prod
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    try {
        await dbConnect();

        // 2. Find Users: 
        // - Email Notifications Enabled
        // - Streak > 0 (Don't bug people with 0 streak to maintain a 0 streak)
        // - Last Study Date is NOT Today

        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Users who have a streak, allow notifications, and last studied BEFORE today's 00:00
        const usersToRemind = await User.find({
            emailNotifications: true,
            streakDays: { $gt: 0 },
            lastStudyDate: { $lt: startOfToday }
        });

        if (usersToRemind.length === 0) {
            return NextResponse.json({ message: 'No reminders needed.' });
        }

        // 3. Setup Mailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 4. Send Emails (LIMIT BATCH SIZE IN PROD - Demo Mode sends all)
        const results = await Promise.allSettled(usersToRemind.map(async (user) => {
            const html = getStreakReminderTemplate(user.name, user.streakDays);

            await transporter.sendMail({
                from: '"SmartVU Team" <' + process.env.SMTP_USER + '>',
                to: user.email,
                subject: `🔥 Save your ${user.streakDays} day streak!`,
                html: html,
            });
            return user.email;
        }));

        const sentCount = results.filter(r => r.status === 'fulfilled').length;

        return NextResponse.json({
            success: true,
            message: `Sent ${sentCount} reminders.`,
            totalCandidates: usersToRemind.length
        });

    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: 'Cron Failed' }, { status: 500 });
    }
}
