
const mongoose = require('mongoose');

// Define minimal schemas if we don't want to import form app (simplifies script execution)
// Better to just use the MONGODB_URI directly.

const MONGODB_URI = 'mongodb+srv://ahssanturk:SmartU123.@cluster0.s2mh1ov.mongodb.net/';

async function seed() {
    if (!MONGODB_URI) {
        console.error('URI missing');
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Define Models (Inline to avoid ESM import issues in simple script)
        const Task = mongoose.models.Task || mongoose.model('Task', new mongoose.Schema({
            courseCode: String, type: String, title: String, dueDate: Date
        }, { strict: false }));

        const Content = mongoose.models.Content || mongoose.model('Content', new mongoose.Schema({
            type: String, title: String, description: String, date: Date, author: String
        }, { strict: false }));

        // Clear old data
        await Task.deleteMany({});
        await Content.deleteMany({});

        // Create Tasks
        const now = new Date();

        // 1. Urgent Quiz (Due in 5 hours)
        const urgentDate = new Date(now.getTime() + 5 * 60 * 60 * 1000);

        // 2. Upcoming Assignment (Due in 2 days)
        const upcomingDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

        // 3. Far Quiz (Due in 5 days)
        const farDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

        await Task.create([
            { courseCode: 'CS101', type: 'Quiz', title: 'Quiz 3: Functions', dueDate: urgentDate },
            { courseCode: 'MTH101', type: 'Assignment', title: 'Calculus Assignment 2', dueDate: upcomingDate },
            { courseCode: 'ENG101', type: 'Quiz', title: 'Grammar Quiz', dueDate: farDate },
        ]);

        // Create Content
        await Content.create([
            { type: 'Quote', description: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", date: now },
            { type: 'Concept', title: "Polymorphism", description: "Objects of different types can be accessed through the same interface.", date: now }
        ]);

        console.log('Seeding Complete!');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seed();
