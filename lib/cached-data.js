import { cacheTag } from 'next/cache';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

export async function getCachedTasks() {
    'use cache';
    cacheTag('smartvu-data');

    await dbConnect();
    // Fetch tasks, sort by creation date desc
    // Using lean() for performance if we don't need hydration, 
    // but here we just return POJOs.
    const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

    // Serialize generic ObjectIds if needed, but for now specific fields
    return tasks.map(task => ({
        ...task,
        _id: task._id.toString(),
        createdAt: task.createdAt?.toISOString(),
        updatedAt: task.updatedAt?.toISOString(),
        dueDate: task.dueDate?.toISOString(),
    }));
}
