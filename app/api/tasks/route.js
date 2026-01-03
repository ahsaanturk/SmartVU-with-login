
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import CourseGroup from '@/models/CourseGroup';
import UserTaskStatus from '@/models/UserTaskStatus';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status') || 'Pending';

        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Get User's Courses for filtering
        const user = await User.findById(userId);

        // Admin Bypass: If admin, maybe return all? But the user specifically asked for "students".
        // Let's stick to student logic. If admin uses this API for "Student View" it works. 
        // Admin list uses a different flow or this flow without token check? 
        // Wait, the Admin Page uses `fetch('/api/tasks?status=Pending')` WITHOUT explicit checks, 
        // relying on the browser cookie. 
        // If the Admin is logged in as Admin, they probably don't have 'selectedCourses'.
        // So they might see nothing if we are strict.

        const userCourses = user?.selectedCourses || [];

        // If user has no courses, they shouldn't see course-specific tasks.
        // Unless it's a "General" task (courseCode: 'ALL'?). Assuming strict course code for now.
        if (userCourses.length === 0 && user?.role !== 'admin') {
            return NextResponse.json({ tasks: [] });
        }

        // Admin sees all? Or we can just fallback to {} for admin.
        const isAdmin = user?.role === 'admin';
        console.log(`[API Debug] User: ${user?.email}, Role: ${user?.role}, isAdmin: ${isAdmin}, Status: ${statusFilter}`);

        const courseQuery = isAdmin ? {} : { courseCode: { $in: userCourses } };

        if (statusFilter === 'Pending') {
            // ...
            const allTasks = await Task.find(courseQuery).sort({ dueDate: 1 });
            // ...
            return NextResponse.json({ tasks: pendingTasks });
        } else if (statusFilter === 'All') {
            // Changing logic: If Admin OR if request specifically asks for All (and we trust the user context?)
            // Actually, if a Student asks for All, they should only see THEIR courses.

            if (isAdmin) {
                const allTasks = await Task.find({}).sort({ createdAt: -1 });
                console.log(`[API Debug] Admin fetching ALL. Count: ${allTasks.length}`);
                return NextResponse.json({ tasks: allTasks });
            } else {
                // Verify student behavior for 'All'? 
                // For now, let's unlock it for testing if it's the issue.
                console.log('[API Debug] Student trying to fetch All - returning empty for now');
                return NextResponse.json({ tasks: [] });
            }
        }
        else {
            // Get tasks FROM UserTaskStatus
            const statuses = await UserTaskStatus.find({ userId, status: statusFilter }).populate('taskId');

            // Filter populated tasks by course (in case user dropped course?)
            // Or usually we show history regardless. Let's keep it simple and just return what they did.
            // But we should filter the 'null' taskIds if a task was deleted.
            const tasks = statuses
                .map(s => s.taskId)
                .filter(t => t !== null); // safety check

            return NextResponse.json({ tasks });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 });
    }
}

// Admin Mock Create
export async function POST(req) {
    try {
        const body = await req.json();
        await dbConnect();

        // 1. Create Task
        const task = await Task.create(body);

        // 2. Fetch Enrolled Users (via CourseGroup or User.selectedCourses)
        // Since CourseGroup might not be fully populated in this MVP, let's query Users directly for reliability
        // Find users who have this course AND have notifications enabled
        const users = await User.find({
            selectedCourses: body.courseCode,
            emailNotifications: { $ne: false }, // Treat undefined as true (default)
            role: 'student'
        }).select('email name');

        const emails = users.map(u => u.email).filter(e => e);

        // 3. Send Email
        if (emails.length > 0) {
            try {
                const nodemailer = require('nodemailer');

                // Check if SMTP vars exist
                if (process.env.SMTP_HOST && process.env.SMTP_USER) {
                    const transporter = nodemailer.createTransport({
                        host: process.env.SMTP_HOST,
                        port: process.env.SMTP_PORT || 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: process.env.SMTP_USER,
                            pass: process.env.SMTP_PASS
                        }
                    });

                    // Calculate Time Remaining for the email content
                    const dueDate = new Date(body.dueDate);
                    const now = new Date();
                    const diffTime = Math.abs(dueDate - now);
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

                    // Send to each user individually to personalize (or BCC for bulk)
                    // For MVP with few users, individual is fine and more personal.
                    // To avoid spam limits, BCC is better. Let's use BCC for efficiency.

                    const { getNewTaskTemplate } = require('@/lib/emailTemplates');
                    const htmlContent = getNewTaskTemplate(body, diffDays, diffHours);

                    await transporter.sendMail({
                        from: '"SmartVU Notifications" <' + process.env.SMTP_USER + '>',
                        bcc: emails, // Use BCC
                        subject: `New Task: ${body.courseCode} - ${body.title}`,
                        html: htmlContent
                    });

                    console.log(`[Email] Sent to ${emails.length} recipients`);
                } else {
                    console.warn('[Email] SMTP Setup Missing - check .env.local');
                    console.log('Would send to:', emails);
                }
            } catch (err) {
                console.error('[Email Failed]', err);
            }
        }

        return NextResponse.json({ task, recipients: emails.length });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
