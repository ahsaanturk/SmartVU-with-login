
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Read Env
const envPath = path.join(__dirname, '..', '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const envConfig = {};
envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envConfig[key.trim()] = value.trim();
    }
});

const MONGODB_URI = envConfig.MONGODB_URI;

// Define Schema (Simplified)
const taskSchema = new mongoose.Schema({}, { strict: false, timestamps: true });
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const count = await Task.countDocuments({});
        const tasks = await Task.find({}).sort({ createdAt: -1 }).limit(5);

        console.log(`Total Tasks in DB: ${count}`);
        console.log('--- Last 5 Tasks ---');
        tasks.forEach(t => {
            console.log(`ID: ${t._id}, Title: ${t.title}, Course: ${t.courseCode}, Created: ${t.createdAt}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

check();
