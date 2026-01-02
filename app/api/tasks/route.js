
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import CourseGroup from '@/models/CourseGroup';
import UserTaskStatus from '@/models/UserTaskStatus';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import User from '@/models/User';

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
        const courseQuery = isAdmin ? {} : { courseCode: { $in: userCourses } };

        if (statusFilter === 'Pending') {
            // Get all tasks NOT in UserTaskStatus(Completed/Missed) AND match course
            const allTasks = await Task.find(courseQuery).sort({ dueDate: 1 });
            const statuses = await UserTaskStatus.find({ userId });

            // Filter out completed ones
            const doneIds = statuses.map(s => s.taskId.toString());
            const pendingTasks = allTasks.filter(t => !doneIds.includes(t._id.toString()));

            return NextResponse.json({ tasks: pendingTasks });
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

        // 2. Fetch Enrolled Users (via CourseGroup - Scalable)
        // Find the single CourseGroup document
        const group = await CourseGroup.findOne({ courseCode: body.courseCode }).populate('studentIds');
        const users = group ? group.studentIds : [];
        const emails = users.map(u => u.email).filter(e => e);

        // 3. Send Email (Mock/Actual)
        if (emails.length > 0) {
            // Mocking logic or strictly implementing if env present
            console.log(`[Email Mock] Sending alert "${body.title}" to:`, emails);

            // TODO: Uncomment when SMTP is configured
            /*
            import nodemailer from 'nodemailer';
            const transporter = nodemailer.createTransport({
                 host: process.env.SMTP_HOST,
                 port: process.env.SMTP_PORT,
                 auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            });
            await transporter.sendMail({
                from: '"SmartVU Admin" <admin@smartvu.edu.pk>',
                to: emails, // BCC is better for privacy: bcc: emails
                subject: `New Alert: ${task.courseCode} - ${task.title}`,
                text: `Dear Student,\n\nA new task "${task.title}" has been posted for ${task.courseCode}.\nType: ${task.type}\nDue: ${new Date(task.dueDate).toLocaleDateString()}\n\nCheck your portal for details.`
            });
            */
        }

        return NextResponse.json({ task, recipients: emails.length });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
