import { unstable_cache } from 'next/cache';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';

export const getCachedTasks = unstable_cache(
    async () => {
        await dbConnect();
        // Fetch tasks, sort by creation date desc
        const tasks = await Task.find({}).sort({ createdAt: -1 }).lean();

        // Serialize generic ObjectIds
        return tasks.map(task => ({
            ...task,
            _id: task._id.toString(),
            createdAt: task.createdAt?.toISOString(),
            updatedAt: task.updatedAt?.toISOString(),
            dueDate: task.dueDate?.toISOString(),
        }));
    },
    ['smartvu-tasks'],
    { tags: ['smartvu-data'] }
);
