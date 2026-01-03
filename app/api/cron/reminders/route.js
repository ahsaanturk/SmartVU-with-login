
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import nodemailer from 'nodemailer';
import { get24HourReminderTemplate, get6HourUrgentTemplate } from '@/lib/emailTemplates';

// This route should be called periodically (e.g. every hour via Setup Cron or External Job)
export async function GET(req) {
    try {
        await dbConnect();

        // Define Time Windows (Approximate to catch hourly runs)
        // 24h Window: Due between 23.5 hours and 24.5 hours from now
        // 6h Window: Due between 5.5 hours and 6.5 hours from now

        const now = new Date();
        const hour = 60 * 60 * 1000;

        const win24_start = new Date(now.getTime() + 23.5 * hour);
        const win24_end = new Date(now.getTime() + 24.5 * hour);

        const win6_start = new Date(now.getTime() + 5.5 * hour);
        const win6_end = new Date(now.getTime() + 6.5 * hour);

        // Find Tasks
        const tasks24 = await Task.find({
            dueDate: { $gte: win24_start, $lt: win24_end }
        });

        const tasks6 = await Task.find({
            dueDate: { $gte: win6_start, $lt: win6_end }
        });

        console.log(`[Cron] Found ${tasks24.length} tasks for 24h reminder and ${tasks6.length} for 6h urgent.`);

        if (tasks24.length === 0 && tasks6.length === 0) {
            return NextResponse.json({ message: 'No reminders needed' });
        }

        // Setup Transporter
        let transporter;
        if (process.env.SMTP_HOST) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
        } else {
            return NextResponse.json({ error: 'SMTP not configured' });
        }

        let emailCount = 0;

        // Process 24h Reminders
        for (const task of tasks24) {
            const users = await User.find({
                selectedCourses: task.courseCode,
                emailNotifications: true,
                role: 'student'
            }).select('email');

            const emails = users.map(u => u.email).filter(e => e);
            if (emails.length > 0) {
                await transporter.sendMail({
                    from: '"SmartVU Reminders" <' + process.env.SMTP_USER + '>',
                    bcc: emails,
                    subject: `⏰ Reminder: ${task.courseCode} Task due in 24 Hours`,
                    html: get24HourReminderTemplate(task)
                });
                emailCount += emails.length;
            }
        }

        // Process 6h Reminders
        for (const task of tasks6) {
            const users = await User.find({
                selectedCourses: task.courseCode,
                emailNotifications: true,
                role: 'student'
            }).select('email');

            const emails = users.map(u => u.email).filter(e => e);
            if (emails.length > 0) {
                await transporter.sendMail({
                    from: '"SmartVU URGENT" <' + process.env.SMTP_USER + '>',
                    bcc: emails,
                    subject: `⚠️ URGENT: ${task.courseCode} Task due in 6 Hours!`,
                    html: get6HourUrgentTemplate(task)
                });
                emailCount += emails.length;
            }
        }

        return NextResponse.json({ success: true, emailsSent: emailCount });

    } catch (error) {
        console.error('Cron Job Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
