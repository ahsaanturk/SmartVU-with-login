
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Task from '../models/Task.js'; // Note .js extension for ESM

dotenv.config({ path: '.env.local' });

async function debugTasks() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('MONGODB_URI is missing');
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const tasks = await Task.find({}).sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${tasks.length} recent tasks.`);

        tasks.forEach(task => {
            console.log('------------------------------------------------');
            console.log(`ID: ${task._id}`);
            console.log(`Title: ${task.title}`);
            console.log(`Type: ${task.type}`);
            console.log(`Quiz Questions Count: ${task.quizQuestions ? task.quizQuestions.length : 0}`);
            if (task.quizQuestions && task.quizQuestions.length > 0) {
                console.log('First Question:', JSON.stringify(task.quizQuestions[0], null, 2));
            }
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugTasks();
