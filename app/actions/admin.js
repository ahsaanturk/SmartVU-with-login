'use server';

import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

export async function createAdminTask(formData) {
    try {
        await dbConnect();

        const title = formData.get('title');
        const courseCode = formData.get('courseCode');
        const description = formData.get('description');
        const dueDate = formData.get('dueDate');
        const type = formData.get('type') || 'Assignment';

        await Task.create({
            title,
            courseCode,
            description,
            dueDate: new Date(dueDate),
            type
        });

        // Invalidate the cache
        revalidateTag('smartvu-data');

        return { success: true, message: 'Task created and cache invalidated!' };
    } catch (error) {
        console.error('Server Action Error:', error);
        return { success: false, message: 'Failed to create task.' };
    }
}
